import type { LocalProxyContext } from '#types';
import { logger } from '@-/logger';
import { trpcResponseSchema } from '@-/trpc/schemas';
import type { SocketStream } from '@fastify/websocket';
import { createId } from '@paralleldrive/cuid2';
import destr from 'destru';
import Emittery from 'emittery';
import { pEvent } from 'p-event';

/**
	Represents a tRPC connection with a Node loader (uses websockets under the hood).
*/
export class NodeLoaderTrpcConnection {
	instrumentationApiServerConnections = new Map<string, SocketStream>();

	/**
		We use a queued emitter instead of sending messages directly to the websocket connection to support queued messages (for when the connection has not yet been initialized)

		Each emitter is associated with a connection.
	*/
	requestEmitters = new Map<string, Emittery<{ message: string }>>();
	responseEmitters = new Map<string, Emittery>();

	static portToNodeLoaderTrpcConnection = new Map<
		number,
		NodeLoaderTrpcConnection
	>();
	context!: LocalProxyContext;

	static getOrCreate({
		port,
		context,
	}: {
		port: number;
		context: LocalProxyContext;
	}) {
		return (
			this.portToNodeLoaderTrpcConnection.get(port) ??
				(() => {
					const connection = new NodeLoaderTrpcConnection();
					connection.context = context;
					this.portToNodeLoaderTrpcConnection.set(port, connection);
					return connection;
				})()
		);
	}

	private constructor() {
		// empty
	}

	/**
		Sends a tRPC request
	*/
	async sendRequest(request: {
		id: string;
		method: 'query' | 'mutation';
		params: {
			path: string;
			input: unknown;
		};
	}) {
		await Promise.all(
			Object.values(this.requestEmitters).map(async (requestEmitter) =>
				requestEmitter.emit('message', JSON.stringify(request))
			),
		);
	}

	async getResponses({ requestId }: { requestId: string }): Promise<
		{
			id: string;
			result: {
				type: 'data';
				data: string;
			};
		}[]
	> {
		return Promise.all(
			Object.values(this.responseEmitters).map(async (responseEmitter) =>
				pEvent(responseEmitter, requestId)
			),
		);
	}

	addInstrumentationApiServerConnection(
		instrumentationApiServerConnection: SocketStream,
	) {
		const requestEmitter = new Emittery<{ message: string }>();
		const responseEmitter = new Emittery();

		const connectionId = createId();
		this.instrumentationApiServerConnections.set(
			connectionId,
			instrumentationApiServerConnection,
		);
		this.requestEmitters.set(connectionId, requestEmitter);
		this.responseEmitters.set(connectionId, responseEmitter);

		instrumentationApiServerConnection.socket.on('close', () => {
			this.instrumentationApiServerConnections.delete(connectionId);
			this.requestEmitters.delete(connectionId);
			this.responseEmitters.delete(connectionId);
		});

		/**
			Forward all requests to the websocket connection.
		*/
		requestEmitter.on('message', (eventData: string) => {
			logger.debug('Request message:', eventData);
			instrumentationApiServerConnection.socket.send(eventData);
		});

		/**
			Forward all responses to the response emitter
		 */
		instrumentationApiServerConnection.socket.addEventListener(
			'message',
			async (messageEvent) => {
				// eslint-disable-next-line @typescript-eslint/no-base-to-string -- TODO
				const messageData = destr(messageEvent.data.toString());
				logger.debug('Response message:', messageData);

				const response = trpcResponseSchema.parse(messageData);

				await responseEmitter.emit(response.id, response);
			},
		);
	}
}
