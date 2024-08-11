/* eslint-disable @typescript-eslint/no-non-null-assertion -- annoying */

import type { LocalProxyContext } from '#types';
import { logger } from '@-/logger';
import { getPatchedResponse } from '@-/patch-response';
import decompressResponse from 'decompress-response';
import { Buffer } from 'node:buffer';
import http, {
	type IncomingMessage,
	type RequestOptions,
	type ServerResponse,
} from 'node:http';
import safeURL from 'safer-url';
import type { SetRequired } from 'type-fest';

function _createHttpRequestToCli({
	requestOptions,
	request,
	response,
	hostUrl,
}: {
	requestOptions: SetRequired<RequestOptions, 'path'>;
	request: IncomingMessage;
	response: ServerResponse;
	hostUrl: globalThis.URL;
}) {
	const httpRequestToCli = http.request(
		requestOptions,
		async (localApplicationResponse) => {
			logger.debug(`< ${String(requestOptions.path)}`);

			if (
				localApplicationResponse.headers['content-type']?.includes('text/html')
			) {
				localApplicationResponse = decompressResponse(localApplicationResponse);

				const localApplicationResponseBodyPromise = new Promise<Buffer>(
					(resolve, reject) => {
						const bodyChunks: Buffer[] = [];

						localApplicationResponse.on('data', (data) => {
							bodyChunks.push(data);
						});

						localApplicationResponse.on('end', () => {
							resolve(Buffer.concat(bodyChunks));
						});

						localApplicationResponse.on('error', (error) => {
							reject(error);
						});
					},
				);

				const localApplicationResponseBody =
					await localApplicationResponseBodyPromise;

				const { body, headers, httpVersionMajor, statusCode } =
					await getPatchedResponse({
						hostUrl,
						request: requestOptions,
						response: localApplicationResponse,
						responseBody: localApplicationResponseBody,
					});

				response.writeHead(
					statusCode,
					httpVersionMajor >= 2 ?
						headers :
						{
							...headers,
							connection: 'close',
							// connection: 'keep-alive',
							// 'keep-alive': 'timeout=15, max=1000'
						},
				);

				response.write(body, () => {
					response.end();
					localApplicationResponse.destroy();
					response.destroy();
				});
			} else {
				response.writeHead(
					localApplicationResponse.statusCode ?? 200,
					localApplicationResponse.httpVersionMajor >= 2 ?
						localApplicationResponse.headers :
						{
							...localApplicationResponse.headers,
							connection: 'close',
							// connection: 'keep-alive',
							// 'keep-alive': 'timeout=15, max=1000'
						},
				);

				localApplicationResponse.pipe(response);
			}
		},
	);

	httpRequestToCli.on('error', (error) => {
		logger.error('client request error', error);
	});

	request.on('end', () => {
		logger.debug('finished pumping request');
		httpRequestToCli.end();
	});

	request.pipe(httpRequestToCli, { end: false });
}

function getProtocol(request: IncomingMessage) {
	return request.headers.host?.startsWith('localhost') ? 'http' : 'https';
}

/**
	Handles a request from a `tunnelapp.dev` domain
*/
export function handleTunnelappRequest({
	context,
	request,
	response,
}: {
	context: LocalProxyContext<{
		isApplicationProcessRunning: true;
		hasProjectLivePreview: true;
		actorType: 'User';
	}>;
	request: IncomingMessage;
	response: ServerResponse;
}) {
	const requestUrl = (request.url ?? '/').replace(/^\/__app/, '');
	const { localApplicationLocalAddress } = context.state.localProjectRuntime;
	const { localServicePortNumber } = context.state.localProjectEnvironment;

	const { host } = request.headers;
	if (host === undefined) {
		throw new Error('Missing `host` header');
	}

	const hostUrl = safeURL(
		`${getProtocol(request)}://${host}`,
	);

	if (hostUrl === null) {
		throw new Error('Invalid `host` header');
	}

	const headersToForward: Record<string, any> = {
		...request.headers,
		host: `${localApplicationLocalAddress}:${localServicePortNumber}`,
	};

	const requestOptions = {
		path: requestUrl,
		port: localServicePortNumber,
		method: request.method,
		headers: headersToForward,
		host: localApplicationLocalAddress,
	} satisfies RequestOptions;

	_createHttpRequestToCli({
		hostUrl,
		requestOptions,
		request,
		response,
	});
}

/**
	Handles both local and remote requests:
	- "local" requests from a local browser (`http://localhost`)
	- "remote" requests from a `tunnelapp.dev` domain (i.e. `@-/localtunnel-server`)
*/
export function handleLocalhostRequest({
	context,
	request,
	response,
}: {
	context: LocalProxyContext<{
		isApplicationProcessRunning: true;
		actorType: 'User';
	}>;
	request: IncomingMessage;
	response: ServerResponse;
}) {
	const requestUrl = (request.url ?? '/').replace(/^\/__app/, '');
	const { localApplicationLocalAddress } = context.state.localProjectRuntime;
	const { localServicePortNumber } = context.state.localProjectEnvironment;

	const { host } = request.headers;
	if (host === undefined) {
		throw new Error('Missing `host` header');
	}

	const hostUrl = safeURL(
		`${getProtocol(request)}://${host}`,
	);

	if (hostUrl === null) {
		throw new Error('Invalid `host` header');
	}

	const headersToForward: Record<string, any> = {
		...request.headers,
		host: `${localApplicationLocalAddress}:${localServicePortNumber}`,
	};

	const requestOptions = {
		path: requestUrl,
		port: localServicePortNumber,
		method: request.method,
		headers: headersToForward,
		host: localApplicationLocalAddress,
	} satisfies RequestOptions;

	_createHttpRequestToCli({
		hostUrl,
		requestOptions,
		response,
		request,
	});
}
