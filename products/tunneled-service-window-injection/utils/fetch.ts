/* eslint-disable complexity -- todo */

import { select } from '@-/client-doc';
import { getHostnameType, HostEnvironmentType } from '@-/host-environment';
import type { NetworkLogEntry } from '@-/logs';
import {
	maskHighEntropySubstrings,
	maskSecretsInObject,
} from '@-/mask-secrets';
import { SuperJSON } from '@-/superjson';
import { getActiveProjectLivePreview } from '@-/tunneled-service-environment';
import { getTunnelGlobals } from '@-/tunneled-service-globals';
import { isLocalUrl, toTunnelappUrl } from '@-/url';
import { ApiUrl } from '@-/url/api';
import { createId } from '@paralleldrive/cuid2';
import blobToBuffer from 'blob-to-buffer';
import { excludeKeys } from 'filter-obj';
import isUtf8 from 'isutf8';
import mapObject from 'map-obj';
import safeUrl from 'safer-url';
import { getBodyAsBufferOrBlobOrStream, isBlob } from './body.ts';
// eslint-disable-next-line unicorn/prefer-node-protocol -- Using browser
import { Buffer } from 'buffer/index.js';

async function requestPortProxyingPermissionIfNeeded({
	originalUrl,
}: {
	originalUrl: globalThis.URL;
}) {
	const tunnelGlobals = getTunnelGlobals();
	if (!tunnelGlobals) {
		return;
	}

	const {
		getContext,
		portProxying,
		tunneledServiceEnvironmentData,
	} = tunnelGlobals;

	if (tunneledServiceEnvironmentData === null) {
		return;
	}

	const context = getContext?.();
	const state = context?.store.getState();

	// We don't need to request permission if the host environment is a script tag
	if (
		tunneledServiceEnvironmentData.hostEnvironment.type ===
			HostEnvironmentType.scriptTag
	) {
		return;
	}

	// We don't need to request permission on a local environment
	if (
		tunneledServiceEnvironmentData.hostEnvironment.type ===
			HostEnvironmentType.wrapperCommand &&
		getHostnameType(window.location) ===
			'local'
	) {
		return;
	}

	// dprint-ignore
	const tunnelInstanceProxyPreview =
		state === undefined ?
			tunneledServiceEnvironmentData.tunnelInstanceProxyPreview :
		state.tunnelInstanceProxyPreviewId === null ?
			null :
		select(state, 'TunnelInstanceProxyPreview', state.tunnelInstanceProxyPreviewId);

	// dprint-ignore
	const projectLivePreview =
		state === undefined ?
			tunneledServiceEnvironmentData.projectLivePreviews[0] ?? null :
		state.projectLivePreviewId === null ?
			null :
		select(state, 'ProjectLivePreview', state.projectLivePreviewId);

	// If there is no tunnel instance, there is no need to block port proxying requests
	if (tunnelInstanceProxyPreview === null || projectLivePreview === null) {
		return;
	}

	const { allowedPortNumbers, disallowedPortNumbers } =
		tunnelInstanceProxyPreview;

	// Before proxying the port, we need to check if the port is allowed
	if (isLocalUrl({ url: originalUrl })) {
		const portNumber = Number(originalUrl.port);
		if (disallowedPortNumbers.includes(portNumber)) {
			portProxying.blockPortProxyRequest({
				portNumber,
				isDisallowed: true,
			});

			// If the user is not the host, we display a modal letting them know that the host disallowed proxying on this port
			portProxying.displayDisallowedPortProxyingNotice({
				portNumber,
			});

			throw new Error(
				`[tunnel.dev] The host of this Tunnel has blocked port ${portNumber} from being proxied`,
			);
		} else if (
			String(portNumber) !== window.location.port &&
			!allowedPortNumbers.includes(portNumber)
		) {
			// dprint-ignore
			const user =
				state === undefined ?
					null :
				state.actor === null ?
					null :
				select(state, 'User', state.actor.data.id);

			if (
				// @ts-expect-error: broken
				projectLivePreview.createdByUser !== null &&
				// @ts-expect-error: broken
				projectLivePreview.createdByUser._id !== user?._id
			) {
				const shouldProxyPortPromise = portProxying
					.requestPortProxyingPermission({
						portNumber,
					});

				await shouldProxyPortPromise;
			} else {
				portProxying.blockPortProxyRequest({
					portNumber,
					isDisallowed: false,
				});

				throw new Error(
					`[tunnel.dev] Blocked request to "${originalUrl.toString()}" as the host has not enabled requests to port ${portNumber}`,
				);
			}
		}
	}
}

export function patchWindowFetch() {
	const tunnelGlobals = getTunnelGlobals();
	if (!tunnelGlobals) return;
	const { getContext, networkLogsHistory } = tunnelGlobals;
	const hostnameType = getHostnameType(window.location);

	const getProjectLivePreview = () => {
		const tunnelGlobals = getTunnelGlobals();
		if (!tunnelGlobals) return null;
		const { getContext, tunneledServiceEnvironmentData } = tunnelGlobals;

		const context = getContext?.();
		const state = context?.store.getState();

		// dprint-ignore
		return state === undefined ?
			tunneledServiceEnvironmentData === null ?
				null :
			getActiveProjectLivePreview(tunneledServiceEnvironmentData) :
		state.projectLivePreviewId === null ?
			null :
		select(state, 'ProjectLivePreview', state.projectLivePreviewId);
	};

	const getTunnelInstanceProxyPreview = () => {
		const tunnelGlobals = getTunnelGlobals();
		if (!tunnelGlobals) return null;
		const { getContext, tunneledServiceEnvironmentData } = tunnelGlobals;

		const context = getContext?.();
		const state = context?.store.getState();

		// dprint-ignore
		return state === undefined ?
			tunneledServiceEnvironmentData === null ?
				null :
			tunneledServiceEnvironmentData.tunnelInstanceProxyPreview :
				state.tunnelInstanceProxyPreviewId === null ?
			null :
		select(state, 'TunnelInstanceProxyPreview', state.tunnelInstanceProxyPreviewId);
	};

	const supportsStreams = (() => {
		let duplexAccessed = false;
		let hasContentType = false;
		const supportsReadableStream =
			typeof globalThis.ReadableStream === 'function';

		if (supportsReadableStream) {
			hasContentType = new globalThis.Request('', {
				body: new globalThis.ReadableStream(),
				method: 'POST',
				// @ts-expect-error - Types are outdated.
				get duplex() {
					duplexAccessed = true;
					return 'half';
				},
			}).headers.has('Content-Type');
		}

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- might be changed in callback
		return duplexAccessed && !hasContentType;
	})();

	function cloneRequest(
		options: RequestInit | undefined,
		{ url }: { url: globalThis.URL },
	) {
		const requestOptions: RequestInit = {
			body: options?.body,
			cache: options?.cache,
			credentials: options?.credentials,
			headers: options?.headers,
			integrity: options?.integrity,
			keepalive: options?.keepalive,
			method: options?.method,
			mode: options?.mode,
			redirect: options?.redirect,
			referrer: options?.referrer,
			referrerPolicy: options?.referrerPolicy,
			signal: options?.signal,
		};

		if (supportsStreams) {
			// @ts-expect-error - Types are outdated.
			requestOptions.duplex = 'half';
		}

		return new Request(url, requestOptions);
	}

	const window_fetch = window.fetch.bind(window);
	const { Request } = window;

	const fetch: typeof window.fetch = async (resource, options) => {
		let _fetch = window_fetch;

		const originalUrl = typeof resource === 'string' ?
			safeUrl(resource, window.location.href) :
			resource instanceof globalThis.URL ?
			resource :
			// We want to prevent `fetch()` calls without parameters from throwing a property access error
			// eslint-disable-next-line unicorn/no-typeof-undefined -- Avoid ESLint complaining about no unnecessary condition
			typeof resource === 'undefined' ?
			null :
			safeUrl(resource.url, window.location.href);

		// Pass through invalid URLs to the native fetch function so that it throws the expected error
		if (originalUrl === null) {
			return _fetch(resource, options);
		}

		const context = getContext?.();
		const state = context?.store.getState();

		const fullUrl = resource instanceof globalThis.URL ?
			resource.toString() :
			typeof resource === 'string' ?
			safeUrl(resource, window.location.origin)?.toString() ?? resource :
			resource.url;

		const requestHeaders = options !== undefined ?
			options.headers :
			typeof resource === 'string' || resource instanceof globalThis.URL ?
			undefined :
			resource.headers;

		const requestHeadersObject = requestHeaders === undefined ?
			{} :
			Array.isArray(requestHeaders) ?
			Object.fromEntries(requestHeaders) :
			'forEach' in requestHeaders &&
				typeof requestHeaders.forEach === 'function' ?
			(() => {
				const headers: Record<string, string> = {};
				// eslint-disable-next-line unicorn/no-array-for-each -- headers
				requestHeaders.forEach((value, key) => {
					headers[key] = value;
				});
				return headers;
			})() :
			requestHeaders as Record<string, string>;

		const bodyInit = options !== undefined ?
			options.body :
			typeof resource === 'string' || resource instanceof globalThis.URL ?
			undefined :
			resource.body;
		let requestBody = bodyInit;

		const shouldLogRequest = (() => {
			// @ts-expect-error: Custom property
			if (options?.__TUNNEL_REQUEST__) {
				return false;
			}

			// Don't log network requests to Tunnel APIs
			return originalUrl.hostname !==
					ApiUrl.getWebappUrl({
						withScheme: false,
						fromWindow: true,
					}) &&
				// Don't log requests in the `fetch` patch if the service worker is active (the request will be logged by the service worker instead)
				!state?.isServiceWorkerActive;
		})();

		if (shouldLogRequest) {
			const requestId = createId();
			const body = getBodyAsBufferOrBlobOrStream(bodyInit);

			const clonedBody: Buffer | null | undefined | Promise<ArrayBuffer> =
				// eslint-disable-next-line @typescript-eslint/promise-function-async -- we also return non-Promise values
				(() => {
					if (body === null || body === undefined || Buffer.isBuffer(body)) {
						return body;
					}

					if (isBlob(body)) {
						return new Promise<Buffer>((resolve, reject) => {
							blobToBuffer(body, (err, buffer) => {
								if (err !== null) {
									reject(err);
									return;
								}

								resolve(buffer as unknown as Buffer);
							});
						});
					}

					const [stream1, stream2] = body.tee();
					requestBody = stream1;
					return new Response(stream2).arrayBuffer();
				})();

			const _getStringifiedRequestBody = () => {
				const stringifiedBody = clonedBody === null ?
					null :
					clonedBody === undefined ?
					null :
					'then' in clonedBody ?
					null :
					JSON.stringify(maskSecretsInObject(
						isUtf8(clonedBody) ?
							SuperJSON.serialize(clonedBody.toString()) :
							SuperJSON.serialize(clonedBody),
					));

				if (
					typeof stringifiedBody === 'string' && stringifiedBody.length > 10_000
				) {
					return SuperJSON.stringify('[Request body too large]');
				}

				return stringifiedBody;
			};

			const networkLogEntry: NetworkLogEntry = {
				id: requestId,
				url: fullUrl,
				method: options?.method ?? 'GET',
				requestBody: null,
				// Request body logging is temporarily disabled until perf issues can be resolved
				// requestBody: getStringifiedRequestBody(),
				responseBody: null,
				decodedBodySize: null,
				encodedBodySize: null,
				initiatorType: 'fetch',
				requestHeaders: mapObject(
					excludeKeys(requestHeadersObject, (key) => {
						const lowercaseKey = String(key).toLowerCase();
						return lowercaseKey === 'authorization' ||
							lowercaseKey === 'cookie' || lowercaseKey === 'set-cookie' ||
							lowercaseKey === 'x-csrf-token' ||
							lowercaseKey === 'x-xsrf-token';
					}) as Record<string, string>,
					(key, value) => [key, maskHighEntropySubstrings(value)],
				),
				responseEnd: null,
				responseHeaders: {},
				responseStatusCode: null,
				startTime: Date.now(),
				transferSize: null,
				duration: null,
				source: 'fetch',
			};

			networkLogsHistory.push(networkLogEntry);

			if (
				clonedBody !== null && clonedBody !== undefined && 'then' in clonedBody
			) {
				void clonedBody.then((body) => {
					networkLogEntry.transferSize = body.byteLength;
				});
			}

			_fetch = async (resource, options) => {
				return window_fetch(resource, options).then((response) => {
					const clonedResponse = response.clone();

					networkLogEntry.responseStatusCode = response.status;

					const performanceEntry = window.performance.getEntriesByName(fullUrl)
						.at(-1);
					if (performanceEntry !== undefined) {
						const properties = [
							'decodedBodySize',
							'encodedBodySize',
							'responseEnd',
							'duration',
							'transferSize',
						] as const;

						for (const property of properties) {
							if (property in performanceEntry) {
								networkLogEntry[property] = performanceEntry[
									property as keyof typeof performanceEntry
								] as number;
							}
						}
					}

					if (
						clonedResponse.headers.get('content-type') === 'application/json'
					) {
						void clonedResponse.text().then((text) => {
							if (text.length > 10_000) {
								networkLogEntry.responseBody = SuperJSON.stringify(
									'[Response body too large]',
								);
							} else {
								networkLogEntry.responseBody = JSON.stringify(
									// eslint-disable-next-line no-restricted-properties -- todo
									maskSecretsInObject(JSON.parse(text)),
								);
							}
						});
					} else if (
						clonedResponse.headers.get('content-type') === 'text/plain'
					) {
						void clonedResponse.text().then((body) => {
							networkLogEntry.responseBody = SuperJSON.stringify(
								body.length > 10_000 ? body : '[Response body too large]',
							);
						});
					}

					return response;
				});
			};
		}

		if (hostnameType !== 'tunnelapp') {
			return _fetch(
				resource,
				options === undefined ? undefined : {
					...options,
					body: requestBody,
				},
			);
		}

		if (!isLocalUrl({ url: originalUrl })) {
			return _fetch(resource, options);
		}

		await requestPortProxyingPermissionIfNeeded({ originalUrl });

		const newUrlString = toTunnelappUrl({
			type: 'tunnel-instance-proxy-preview',
			projectLivePreview: getProjectLivePreview(),
			port: originalUrl.port !== '' ?
				Number(originalUrl.port) :
				getTunnelInstanceProxyPreview()?.localServicePortNumber ?? 80,
			originalUrl,
		});

		let request: Request;
		if (typeof resource === 'string') {
			request = cloneRequest(options, {
				url: newUrlString,
			});
		} else if (resource instanceof globalThis.URL) {
			request = cloneRequest(options, {
				url: newUrlString,
			});
		} else if (resource instanceof Request) {
			request = cloneRequest(options, {
				url: newUrlString,
			});
		} else {
			request = cloneRequest(options, {
				url: newUrlString,
			});
		}

		return _fetch(request, options);
	};

	window.fetch = fetch;
}

export function patchWindowXmlHttpRequest() {
	const XMLHttpRequest_prototype_open = XMLHttpRequest.prototype.open;
	const xmlHttpRequestToOriginalUrl = new WeakMap<
		XMLHttpRequest,
		globalThis.URL
	>();

	const hostnameType = getHostnameType(window.location);

	const getProjectLivePreview = () => {
		const tunnelGlobals = getTunnelGlobals();
		if (!tunnelGlobals) return null;
		const { getContext, tunneledServiceEnvironmentData } = tunnelGlobals;

		const context = getContext?.();
		const state = context?.store.getState();

		// dprint-ignore
		return state === undefined ?
			tunneledServiceEnvironmentData === null ?
				null :
			getActiveProjectLivePreview(tunneledServiceEnvironmentData) :
		state.projectLivePreviewId === null ?
			null :
		select(state, 'ProjectLivePreview', state.projectLivePreviewId);
	};

	const getTunnelInstanceProxyPreview = () => {
		const tunnelGlobals = getTunnelGlobals();
		if (!tunnelGlobals) return null;
		const { getContext, tunneledServiceEnvironmentData } = tunnelGlobals;

		const context = getContext?.();
		const state = context?.store.getState();

		// dprint-ignore
		return state === undefined ?
			tunneledServiceEnvironmentData === null ?
				null :
			tunneledServiceEnvironmentData.tunnelInstanceProxyPreview :
				state.tunnelInstanceProxyPreviewId === null ?
			null :
		select(state, 'TunnelInstanceProxyPreview', state.tunnelInstanceProxyPreviewId);
	};

	const idToRequest = new Map<string, any>();

	XMLHttpRequest.prototype.open = function open(...args: any) {
		const [method, url] = args;
		const requestId = createId();
		// @ts-expect-error: Custom property
		this.__tunnelId = requestId;

		idToRequest.set(requestId, {
			url: url.toString(),
			method,
		});

		const originalUrl = safeUrl(url, window.location.href);
		if (originalUrl === null) {
			return XMLHttpRequest_prototype_open.apply(this, args);
		}

		if (hostnameType !== 'tunnelapp') {
			return XMLHttpRequest_prototype_open.apply(this, args);
		}

		xmlHttpRequestToOriginalUrl.set(this, originalUrl);

		if (isLocalUrl({ url: originalUrl })) {
			args[1] = toTunnelappUrl({
				projectLivePreview: getProjectLivePreview(),
				port: originalUrl.port !== '' ?
					Number(originalUrl.port) :
					getTunnelInstanceProxyPreview()?.localServicePortNumber ?? 80,
				type: 'tunnel-instance-proxy-preview',
				originalUrl,
			});
		}

		return XMLHttpRequest_prototype_open.apply(this, args);
	};

	const XMLHttpRequest_setRequestHeader =
		XMLHttpRequest.prototype.setRequestHeader;
	XMLHttpRequest.prototype.setRequestHeader = function setRequestHeader(
		...args: any
	) {
		const [name, value] = args;
		// @ts-expect-error: Custom property
		const requestId: string = this.__tunnelId;

		const request = idToRequest.get(requestId);

		if (request !== undefined) {
			request.headers ??= {};
			request.headers[name] = value;
		}

		return XMLHttpRequest_setRequestHeader.apply(this, args);
	};

	const XMLHttpRequest_prototype_send = XMLHttpRequest.prototype.send;
	XMLHttpRequest.prototype.send = function send(...args: any) {
		// @ts-expect-error: Custom property
		const requestId: string = this.__tunnelId;
		const request = idToRequest.get(requestId);

		if (request !== undefined) {
			request.body = args[0];

			const tunnelGlobals = getTunnelGlobals();
			if (tunnelGlobals !== undefined) {
				const { networkLogsHistory } = tunnelGlobals;
				const networkLogEntry: NetworkLogEntry = {
					id: requestId,
					method: request.method,
					requestBody: null,
					// Request body logging is temporarily disabled until perf issues can be resolved
					// JSON.stringify(
					// 	maskSecretsInObject(SuperJSON.serialize(args[0])),
					// ),
					responseBody: null,
					decodedBodySize: 0,
					encodedBodySize: 0,
					initiatorType: 'XMLHttpRequest',
					requestHeaders: {},
					responseEnd: null,
					responseStatusCode: null,
					responseHeaders: {},
					startTime: Date.now(),
					transferSize: null,
					duration: null,
					url: request.url,
					source: 'XMLHttpRequest',
				};

				networkLogsHistory.push(networkLogEntry);
			}

			const onReadyStateChange = () => {
				if (this.readyState === 4) {
					// networkLogEntry.responseBody = this.response.length > 10_000 ?
					// 	'[Request body too large]' :
					// 	JSON.stringify(
					// 		maskSecretsInObject(SuperJSON.serialize(this.responseText)),
					// 	);
					this.removeEventListener('readystatechange', onReadyStateChange);
				}
			};

			this.addEventListener('readystatechange', onReadyStateChange);

			idToRequest.delete(requestId);
		}

		const originalUrl = xmlHttpRequestToOriginalUrl.get(this);

		if (originalUrl === undefined) {
			return XMLHttpRequest_prototype_send.apply(this, args);
		}

		if (hostnameType !== 'tunnelapp') {
			return XMLHttpRequest_prototype_send.apply(this, args);
		}

		requestPortProxyingPermissionIfNeeded({
			originalUrl,
		})
			.then(() => {
				XMLHttpRequest_prototype_send.apply(this, args);
			})
			// eslint-disable-next-line no-console -- We should error
			.catch((error) => console.error(error));
	};
}
