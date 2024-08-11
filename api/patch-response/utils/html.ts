import type {
	ChildNode,
	Document,
} from '../node_modules/parse5/dist/tree-adapters/default.js';

export function locateHtmlHeadNode(
	htmlDocument: Document,
): ChildNode | undefined {
	const htmlNode = htmlDocument.childNodes.find(
		(childNode) => childNode.nodeName === 'html',
	);
	if (htmlNode === undefined) return undefined;
	if (!('childNodes' in htmlNode)) return undefined;

	const headNode = htmlNode.childNodes.find(
		(childNode) => childNode.nodeName === 'head',
	);
	if (headNode === undefined) return undefined;
	// We treat an implicitly created <head> element as no <head> element
	if (
		headNode.sourceCodeLocation === null ||
		headNode.sourceCodeLocation === undefined
	) {
		return undefined;
	}

	return headNode;
}

export function locateHtmlBodyNode(
	htmlDocument: Document,
): ChildNode | undefined {
	const htmlNode = htmlDocument.childNodes.find(
		(childNode) => childNode.nodeName === 'html',
	);
	if (htmlNode === undefined) return undefined;
	if (!('childNodes' in htmlNode)) return undefined;

	const bodyNode = htmlNode.childNodes.find(
		(childNode) => childNode.nodeName === 'body',
	);
	if (bodyNode === undefined) return undefined;
	// We treat an implicitly created <body> element as no <body> element
	if (
		bodyNode.sourceCodeLocation === null ||
		bodyNode.sourceCodeLocation === undefined
	) {
		return undefined;
	}

	return bodyNode;
}
