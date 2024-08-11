import { NodeLoaderTrpcConnection } from '#classes/_.ts';
import type { RouteThis } from '#types';
import { logger } from '@-/logger';
import type { SocketStream } from '@fastify/websocket';
import type { IncomingMessage } from 'node:http';

/**
	This route is for establishing a two-way websocket connection to an application using Tunnel's Node Loader.

	Note that multiple instrumentation APIs from one application can subscribe to this loader
*/
export function WS(
	this: RouteThis,
	connection: SocketStream,
	request: IncomingMessage,
) {
	const { context } = this;

	const portString = request.url?.match(
		/\/__tunnel\/ws\/instrumentation\/(\d+)\/subscribe-from-loader/,
	)?.[1];

	if (portString === undefined) {
		connection.write('Invalid URL');
		connection.end();
		return;
	}

	const port = Number(portString);
	if (Number.isNaN(port)) {
		connection.write('Invalid port');
		connection.end();
		return;
	}

	logger.debug(`New instrumentation API server connection to port ${port}`);

	NodeLoaderTrpcConnection.getOrCreate({
		port,
		context,
	}).addInstrumentationApiServerConnection(connection);
}
