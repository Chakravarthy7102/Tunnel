import type { PatchedResponse } from '#types';
import { xPathValue } from '#utils/xpath.ts';
import { logger } from '@-/logger';
import { getProjectLivePreviewPageToolbarJavascriptUrl } from '@-/tunnel-instance-page-toolbar';
import { getSetGlobalTunneledServiceEnvironmentDataJavascriptUrl } from '@-/tunneled-service-environment';
import { getTunneledServiceWindowInjectionJavascriptUrl } from '@-/tunneled-service-window-injection/url';
import parseContentSecurityPolicy from 'content-security-policy-parser';
import { inPlaceSort } from 'fast-sort';
import findLast from 'lodash.findlast';
import { Buffer } from 'node:buffer';
import type { IncomingMessage, RequestOptions } from 'node:http';
import { parse as parseHtml } from 'parse5';
import type { SetRequired } from 'type-fest';
import type {
	ChildNode,
	Document,
	Element,
	Node,
} from '../node_modules/parse5/dist/tree-adapters/default.js';
import { locateHtmlBodyNode, locateHtmlHeadNode } from './html.ts';

function locateMetaContentSecurityPolicyNode(
	htmlDocument: Document,
): ChildNode | undefined {
	const headNode = locateHtmlHeadNode(htmlDocument);
	if (headNode === undefined || !('childNodes' in headNode)) return undefined;
	const contentSecurityPolicyNode = findLast(
		headNode.childNodes,
		(childNode) =>
			childNode.nodeName === 'meta' &&
			childNode.attrs.some(
				(attr) =>
					attr.name === 'http-equiv' &&
					attr.value === 'Content-Security-Policy',
			),
	);
	return contentSecurityPolicyNode;
}

function _getScriptNodes(htmlDocument: Document): Element[] {
	const scriptNodes: Element[] = [];
	const getChildScriptNodes = (childNode: ChildNode): void => {
		if (!('childNodes' in childNode)) return;
		if (childNode.nodeName === 'script') {
			scriptNodes.push(childNode);
		}

		for (const node of childNode.childNodes) {
			getChildScriptNodes(node);
		}
	};

	for (const childNode of htmlDocument.childNodes) {
		getChildScriptNodes(childNode);
	}

	return scriptNodes;
}

/**
	@param param
	@param param.tunnel - Contains necessary tunnel info for pactching
	@param param.response - The original full response
	@param param.responseBody - The original full body of the response
	@returns Monkeypatched response
*/
// eslint-disable-next-line complexity -- bruh
export async function getPatchedResponse({
	hostUrl,
	response,
	responseBody: responseBodyBuffer,
}: {
	hostUrl: globalThis.URL;
	request: SetRequired<RequestOptions, 'path'>;
	response: IncomingMessage;
	responseBody: Buffer;
}): Promise<PatchedResponse> {
	let responseBody = responseBodyBuffer.toString();

	const contentType = response.headers['content-type'];

	// If the body is HTML, we inject a `window.fetch` patch that resolves requests to http://localhost into the custom Tunnel domain
	if (contentType?.startsWith('text/html')) {
		const htmlDocument = parseHtml(responseBody, {
			sourceCodeLocationInfo: true,
		});

		// For SSR, we need to remove all the `data-__tnl-event-id` attribute to avoid hydration errors. Instead, we generate a script that associates each event ID with an element reference using XPaths

		// Find all the <script> tags in the code and patch the JavaScript code to use a window proxy
		const codeReplacements: {
			start: number;
			end: number;
			value: string;
		}[] = [];

		const xpathToDataTnlEventId: Record<string, string> = {};
		const recursivelyRemoveNodeTnlEventIdAttribute = (
			node: Node,
			xpathSteps: string[],
		) => {
			const dataTnlEventIdAttribute = 'attrs' in node ?
				node.attrs.find((attr) => attr.name === 'data-__tnl-event-id') :
				undefined;

			if (dataTnlEventIdAttribute !== undefined) {
				xpathToDataTnlEventId[xpathSteps.join('/')] =
					dataTnlEventIdAttribute.value;

				const attributeLocation =
					node.sourceCodeLocation && 'attrs' in node.sourceCodeLocation ?
						node.sourceCodeLocation.attrs?.['data-__tnl-event-id'] :
						undefined;

				if (attributeLocation !== undefined) {
					codeReplacements.push({
						start: attributeLocation.startOffset,
						end: attributeLocation.endOffset,
						value: '',
					});
				}
			}

			if ('childNodes' in node) {
				for (const childNode of node.childNodes) {
					const xPath = xPathValue(childNode);
					if (xPath !== null) {
						recursivelyRemoveNodeTnlEventIdAttribute(childNode, [
							...xpathSteps,
							xPath.toString(),
						]);
					}
				}
			}
		};

		recursivelyRemoveNodeTnlEventIdAttribute(htmlDocument, []);

		// const populateDomReferencesScriptValue =
		// 	js`
		// 		let${' '}$ = TNL__.${tnlProperties.setElementDomNodeEventIdFromXpath};
		// 		window.addEventListener('DOMContentLoaded', () => {
		// 	` +
		// 	Object.entries(xpathToDataTnlEventId)
		// 		.map(
		// 			([xpath, dataTnlEventId]) =>
		// 				js`
		// 				$(
		// 					${JSON.stringify(xpath)},
		// 					${JSON.stringify(dataTnlEventId)}
		// 				);
		// 			`
		// 		)
		// 		.join('') +
		// 	js`
		// 		})
		// 	`;

		// const scriptNodes = getScriptNodes(htmlDocument);
		// await Promise.all(
		// 	scriptNodes.map(async (scriptNode) => {
		// 		if (
		// 			// Don't patch scripts that have a `src` attribute
		// 			scriptNode.attrs.some((attr) => attr.name === 'src') ||
		// 			// Don't patch scripts that have a `type` attribute equal to something other than `text/javascript` (e.g. Next.js `getServerSideProps` uses a <script> tag with `type="application/json"`)
		// 			scriptNode.attrs.some(
		// 				(attr) =>
		// 					attr.name === 'type' &&
		// 					attr.value !== 'text/javascript' &&
		// 					attr.value !== 'application/javascript'
		// 			) ||
		// 			!scriptNode.sourceCodeLocation ||
		// 			!('startTag' in scriptNode.sourceCodeLocation) ||
		// 			scriptNode.sourceCodeLocation.startTag === undefined ||
		// 			!('endTag' in scriptNode.sourceCodeLocation) ||
		// 			scriptNode.sourceCodeLocation.endTag === undefined
		// 		) {
		// 			return;
		// 		}

		// 		const codeStart = scriptNode.sourceCodeLocation.startTag.endOffset;
		// 		const codeEnd = scriptNode.sourceCodeLocation.endTag.startOffset;
		// 		const scriptCode = body.slice(codeStart, codeEnd);

		// 		const transformedJavascriptCode = getInstrumentedCode({
		// 			code: scriptCode,
		// 			filepath: request.path,
		// 			sourceType: 'module',
		// 			inEval: false,
		// 		});

		// 		codeReplacements.push({
		// 			start: codeStart,
		// 			end: codeEnd,
		// 			value: transformedJavascriptCode
		// 		});
		// 	})
		// );

		// We want to add "fonts.googleapis.com" and 'self' to the Content-Security-Policy header
		const contentSecurityPolicyNode = locateMetaContentSecurityPolicyNode(
			htmlDocument,
		);
		if (
			contentSecurityPolicyNode !== undefined &&
			'attrs' in contentSecurityPolicyNode
		) {
			const contentSecurityPolicyAttr = contentSecurityPolicyNode.attrs.find(
				(attr) => attr.name === 'content',
			);
			if (contentSecurityPolicyAttr !== undefined) {
				const contentSecurityPolicyString = contentSecurityPolicyAttr.value;
				const contentSecurityPolicy: Record<string, string[] | undefined> =
					parseContentSecurityPolicy(contentSecurityPolicyString);
				contentSecurityPolicy['script-src'] ??= [];
				if (!contentSecurityPolicy['script-src'].includes("'self'")) {
					contentSecurityPolicy['script-src'].push("'self'");
				}

				contentSecurityPolicy['style-src'] ??= [];
				if (!contentSecurityPolicy['script-src'].includes("'self'")) {
					contentSecurityPolicy['script-src'].push("'self'");
				}

				if (
					!contentSecurityPolicy['script-src'].includes('fonts.googleapis.com')
				) {
					contentSecurityPolicy['script-src'].push('fonts.googleapis.com');
				}

				// const newContentSecurityPolicyAttr = Object.entries(
				// 	contentSecurityPolicy
				// )
				// 	.map(([policy, values]) => `${policy} ${(values ?? []).join(' ')}`)
				// 	.join('; ');

				// TODO
			}
		}

		const headNode = locateHtmlHeadNode(htmlDocument);
		const bodyNode = locateHtmlBodyNode(htmlDocument);

		const setGlobalTunneledServiceEnvironmentDataJavascriptUrl =
			getSetGlobalTunneledServiceEnvironmentDataJavascriptUrl({
				hostUrl,
			});
		const tunneledServiceWindowInjectionUrl =
			getTunneledServiceWindowInjectionJavascriptUrl({
				hostUrl,
			});
		const pageToolbarUrl = getProjectLivePreviewPageToolbarJavascriptUrl({
			hostUrl,
		});

		const headBeginInjectedTags = `<script src=${
			JSON.stringify(
				setGlobalTunneledServiceEnvironmentDataJavascriptUrl,
			)
		}></script><script src=${
			JSON.stringify(
				tunneledServiceWindowInjectionUrl,
			)
		}></script>`;

		// If there doesn't exist a <head> node, we insert our own <head> node along with a <script> node right under the <html> opening tag so that it's guaranteed to run first
		if (headNode === undefined || !headNode.sourceCodeLocation) {
			logger.debug('Could not find <head> element');

			const htmlNode = htmlDocument.childNodes.find(
				(childNode) => childNode.nodeName === 'html',
			);

			// If there is no <html> node, assume that the document isn't HTML (e.g. Websockets send back data that's typed as text/html but it's actually plaintext)
			if (htmlNode === undefined || !htmlNode.sourceCodeLocation) {
				logger.debug('Could not find <html> element');
			} else {
				if (
					'startTag' in htmlNode.sourceCodeLocation &&
					htmlNode.sourceCodeLocation.startTag !== undefined
				) {
					codeReplacements.push({
						start: htmlNode.sourceCodeLocation.startTag.endOffset,
						end: htmlNode.sourceCodeLocation.startTag.endOffset,
						value: `<head>${headBeginInjectedTags}</head>`,
					});
				} else {
					logger.error('Unknown <html> tag position');
				}
			}
		} else {
			logger.debug('Patching existing <head> element');

			if (
				'startTag' in headNode.sourceCodeLocation &&
				headNode.sourceCodeLocation.startTag !== undefined
			) {
				codeReplacements.push({
					start: headNode.sourceCodeLocation.startTag.endOffset,
					end: headNode.sourceCodeLocation.startTag.endOffset,
					value: headBeginInjectedTags,
				});
			} else {
				logger.error('Unknown <head> tag position');
			}
		}

		const bodyEndInjectedTags = `<script type="module" src=${
			JSON.stringify(
				pageToolbarUrl,
			)
		}></script>`;

		// If there doesn't exist a <body> node, we insert our own <body> node along with a <script> node at the end of the document so it doesn't interfere with hydration
		if (bodyNode === undefined || !bodyNode.sourceCodeLocation) {
			logger.debug('Could not find <body> element');

			const htmlNode = htmlDocument.childNodes.find(
				(childNode) => childNode.nodeName === 'html',
			);

			// If there is no <html> node, assume that the document isn't HTML (e.g. Websockets send back data that's typed as text/html but it's actually plaintext)
			if (htmlNode === undefined || !htmlNode.sourceCodeLocation) {
				logger.debug('Could not find <html> element');
			} else {
				if (
					'endTag' in htmlNode.sourceCodeLocation &&
					htmlNode.sourceCodeLocation.endTag !== undefined
				) {
					codeReplacements.push({
						start: htmlNode.sourceCodeLocation.endTag.startOffset,
						end: htmlNode.sourceCodeLocation.endTag.startOffset,
						value: `<body>${bodyEndInjectedTags}</body>`,
					});
				} else {
					logger.error('Unknown <html> tag position');
				}
			}
		} else {
			logger.debug('Patching existing <body> element');

			if (
				'endTag' in bodyNode.sourceCodeLocation &&
				bodyNode.sourceCodeLocation.endTag !== undefined
			) {
				logger.debug('Adding tags to end of <body>');
				codeReplacements.push({
					start: bodyNode.sourceCodeLocation.endTag.startOffset,
					end: bodyNode.sourceCodeLocation.endTag.startOffset,
					value: bodyEndInjectedTags,
				});
			} else {
				logger.error('Unknown <body> tag position');
			}
		}

		inPlaceSort(codeReplacements).asc((replacement) => replacement.start);

		/** @type {string[]} */
		const newResponseBodyParts = [];
		let previousEnd = 0;
		for (const replacement of codeReplacements) {
			newResponseBodyParts.push(
				responseBody.slice(previousEnd, replacement.start),
				replacement.value,
			);
			previousEnd = replacement.end;
		}

		newResponseBodyParts.push(responseBody.slice(previousEnd));
		responseBody = newResponseBodyParts.join('');
	} /* else if (
	// 	contentType !== undefined &&
	// 	(contentType.startsWith('text/javascript') ||
	// 		contentType.startsWith('application/javascript')) &&
	// 	!request.path.includes('/__tunnel/')
	// ) {
	// 	// const modifiedScriptCode = getInstrumentedCode({
	// 	// 	code: body,
	// 	// 	filepath: request.path,
	// 	// 	sourceType: 'module',
	// 	// 	inEval: false,
	// 	// });
	// 	// body = modifiedScriptCode;
	} */

	const bodyBuffer = Buffer.from(responseBody);

	delete response.headers['transfer-encoding'];
	response.headers['content-length'] = bodyBuffer.length.toString();

	return {
		statusCode: response.statusCode ?? 200,
		body: bodyBuffer,
		headers: response.headers,
		httpVersionMajor: response.httpVersionMajor,
		httpVersionMinor: response.httpVersionMinor,
	};
}
