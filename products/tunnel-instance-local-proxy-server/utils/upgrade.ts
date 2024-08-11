/* eslint-disable @typescript-eslint/no-non-null-assertion -- annoying */

import type { LocalProxyContext } from '#types';
import { logger } from '@-/logger';
import http, {
	type IncomingHttpHeaders,
	type IncomingMessage,
	type RequestOptions,
} from 'node:http';
import type { Socket } from 'node:net';

/**
	WebSocket requests must have the `GET` method and
	the `upgrade:websocket` header

	@param request Request object
	@param socket Websocket
*/
export function checkMethodAndHeader(request: IncomingMessage, socket: Socket) {
	if (request.method !== 'GET' || !request.headers.upgrade) {
		socket.destroy();
		return true;
	}

	if (request.headers.upgrade.toLowerCase() !== 'websocket') {
		socket.destroy();
		return true;
	}
}

/**
	Check if the request has an encrypted connection.

	@param req Incoming HTTP request.

	@returns Whether the connection is encrypted or not.
*/
function hasEncryptedConnection(request: IncomingMessage) {
	// @ts-expect-error: Copied from http-proxy
	return Boolean(request.connection.encrypted || request.connection.pair);
}

/**
	Get the port number from the host. Or guess it based on the connection type.
	@param req Incoming HTTP request.
	@returns The port number.
*/
function getPort(request: IncomingMessage) {
	const response = request.headers.host ?
		request.headers.host.match(/:(\d+)/) :
		'';

	return response ?
		response[1] :
		hasEncryptedConnection(request) ?
		'443' :
		'80';
}

/**
	Sets `x-forwarded-*` headers if specified in config.

	@param request Request object
	@param socket
*/
function setXHeaders({
	request,
}: {
	request: IncomingMessage;
	socket: Socket;
}) {
	return;

	const values = {
		for: request.connection.remoteAddress ?? request.socket.remoteAddress,
		port: getPort(request),
		proto: hasEncryptedConnection(request) ? 'wss' : 'ws',
	};

	for (const header of ['for', 'port', 'proto'] as const) {
		request.headers['x-forwarded-' + header] =
			(request.headers['x-forwarded-' + header] ?? '').toString() +
			(request.headers['x-forwarded-' + header] ? ',' : '') +
			values[header]!;
	}
}

/**
	Set the proper configuration for sockets,
	set no delay and set keep alive, also set
	the timeout to 0.

	Examples:

		setupSocket(socket)
		// => Socket

	@param socket instance to setup

	@returns Return the configured socket.
*/

function setupSocket(socket: Socket) {
	socket.setTimeout(0);
	socket.setNoDelay(true);

	socket.setKeepAlive(true, 0);

	return socket;
}

/**
	Does the actual proxying. Make the request and upgrade it
	send the Switching Protocols request and pipe the sockets.

	@param request Request object
	@param socket Websocket
	@param options Config object passed to the proxy
*/
function streamRequest({
	context,
	request,
	socket,
	head,
}: {
	request: IncomingMessage;
	socket: Socket;
	context: LocalProxyContext<{
		isApplicationProcessRunning: true;
	}>;
	head: Buffer;
}) {
	const createHttpHeader = (line: string, headers: IncomingHttpHeaders) => {
		const head: string[] = [line];
		for (const [key, value] of Object.entries(headers)) {
			if (!Array.isArray(value)) {
				head.push(key + ': ' + value!);
			} else {
				for (const element of value) {
					head.push(key + ': ' + element);
				}
			}
		}

		return head.join('\r\n') + '\r\n\r\n';
	};

	// setupSocket(socket);

	if (head.length > 0) socket.unshift(head);

	const { localServicePortNumber } = context.state.localProjectEnvironment;
	const { localApplicationLocalAddress } = context.state.localProjectRuntime;

	const requestOptions = {
		port: localServicePortNumber,
		host: localApplicationLocalAddress,
		path: request.url,
		method: request.method,
		setHost: false,
		headers: {
			...request.headers,
			host: `localhost:${localServicePortNumber}`,
			origin: `http://localhost:${localServicePortNumber}`,
		},
	} satisfies RequestOptions;

	const proxyReq = http.request(requestOptions);

	// Error Handler
	proxyReq.on('error', onOutgoingError);

	proxyReq.on('response', (response) => {
		// if upgrade event isn't going to happen, close the socket
		// @ts-expect-error: Internal property
		if (!response.upgrade) {
			socket.write(
				createHttpHeader(
					`HTTP/${response.httpVersion} ${response.statusCode!} ${response
						.statusMessage!}`,
					response.headers,
				),
			);
			response.pipe(socket);
		}
	});

	proxyReq.on('upgrade', (proxyResponse, proxySocket) => {
		proxySocket.on('error', onOutgoingError);

		// Allow us to listen when the websocket has completed
		proxySocket.on('end', function() {
			logger.debug('websocket ended');
		});

		// The pipe below will end proxySocket if socket closes cleanly, but not
		// if it errors (eg, vanishes from the net and starts returning
		// EHOSTUNREACH). We need to do that explicitly.
		socket.on('error', (error) => {
			logger.error('Socket error:', error);
			proxySocket.end();
		});

		setupSocket(proxySocket);

		// if (proxyHead && proxyHead.length > 0) proxySocket.unshift(proxyHead);

		const httpHeader = createHttpHeader(
			'HTTP/1.1 101 Switching Protocols',
			proxyResponse.headers,
		);

		// // Remark: Handle writing the headers to the socket when switching protocols
		// // Also handles when a header is an array
		// socket.write(httpHeader);
		socket.write(httpHeader);

		proxySocket.pipe(socket).pipe(proxySocket);
	});

	return proxyReq.end();

	function onOutgoingError(error: Error) {
		logger.error(error.message);

		socket.end();
		process.exit(1);
	}
}

export function handleUpgrade({
	context,
	request,
	head,
	socket,
}: {
	context: LocalProxyContext<{
		isApplicationProcessRunning: true;
	}>;
	httpServer: http.Server;
	request: IncomingMessage;
	head: Buffer;
	socket: Socket;
}) {
	const isDestroyed = checkMethodAndHeader(request, socket);
	if (isDestroyed) {
		logger.error('Destroyed socket');
		return;
	}

	setXHeaders({
		request,
		socket,
	});

	streamRequest({
		head,
		request,
		socket,
		context,
	});
}
