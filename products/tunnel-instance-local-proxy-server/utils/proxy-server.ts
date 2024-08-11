import routes from '#routes/_.ts';
import type { LocalProxyContext, RouteThis } from '#types';
import { registerFastifyRoutes } from '@-/fastify-routes';
import { logger } from '@-/logger';
import { packageSlugpaths } from '@-/packages-config';
import fastifyCookie from '@fastify/cookie';
import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import fastify from 'fastify';
import http from 'node:http';
import { WebSocket } from 'ws';
import {
	getPageInjectionDistDirpath,
	getPageScriptDistDirpath,
	getPageToolbarDistDirpath,
} from './paths.ts';
import { handleLocalhostRequest, handleTunnelappRequest } from './request.ts';
import { handleUpgrade } from './upgrade.ts';

/**
	The proxy server proxies local requests through to the underlying application.

	It also sets up a websocket connection with the live preview server that allows for the preview server to communicate directly to the local proxy server using tRPC.
*/
export async function startLocalProxyServer({
	context,
}: {
	context: LocalProxyContext<{
		actorType: 'User' | null;
	}>;
}) {
	const httpServer = http.createServer();

	// @ts-expect-error: Custom property
	httpServer.__tunnelProxyServer = true;

	const fastifyServer = fastify({
		logger: {
			level: 'warn',
		},
		serverFactory(fastifyHandler) {
			httpServer.on('error', (error) => {
				logger.error('HTTP Server Error:', error);
			});

			httpServer.on('request', async (request, response) => {
				if (request.url === undefined) {
					logger.error('Missing request.url');
					response.writeHead(400);
					response.end();
					return;
				}

				if (request.headers.host === undefined) {
					logger.error('Missing "host" header');
					response.writeHead(400);
					response.end();
					return;
				}

				if (request.url.startsWith('/__tunnel')) {
					fastifyHandler(request, response);
					return;
				}

				if (
					context.state.projectLivePreviewId !== null &&
					request.url.includes('.tunnelapp.')
				) {
					handleTunnelappRequest({
						context,
						request,
						response,
					});
				} else {
					handleLocalhostRequest({
						context,
						request,
						response,
					});
				}
			});

			httpServer.on('upgrade', async (request, socket, head) => {
				const requestUrl = request.url;
				if (requestUrl === undefined) {
					logger.error('Missing request.url');
					socket.end();
					return;
				}

				// TODO: Websocket routes aren't handled by fastify yet
				if (requestUrl.startsWith('/__tunnel')) {
					fastifyServer.websocketServer.handleUpgrade(
						request,
						socket,
						head,
						async (socket) => {
							fastifyServer.websocketServer.emit('connection', socket, request);

							const connection = WebSocket.createWebSocketStream(socket);
							(connection as any).socket = socket;

							connection.on('error', (error) => {
								fastifyServer.log.error(error);
							});

							socket.on('newListener', (event) => {
								if (event === 'message') {
									connection.resume();
								}
							});

							if (requestUrl.startsWith('/__tunnel/api/local-proxy/ws')) {
								routes[
									'products/tunnel-instance-local-proxy-server/routes/__tunnel/ws/instrumentation/[port]/subscribe-from-loader/route.ts'
								].WS.call(
									{ context, fastifyServer } satisfies RouteThis,
									connection as any,
									request,
								);
							} else {
								logger.error(`Unknown websocket route: ${requestUrl}`);
								connection.write(`Unknown websocket route: ${requestUrl}`);
								connection.end();
							}
						},
					);
				} else {
					handleUpgrade({
						context,
						httpServer,
						request,
						socket: socket as any,
						head,
					});
				}
			});

			return httpServer;
		},
	});

	void fastifyServer.register(cors, {
		// Allow all requests
		origin: true,
	});
	void fastifyServer.register(fastifyCookie);

	const pageToolbarDistDirpath = await getPageToolbarDistDirpath();
	const pageScriptDistDirpath = await getPageScriptDistDirpath();
	const pageInjectionDistDirpath = await getPageInjectionDistDirpath();

	void fastifyServer.register(fastifyStatic, {
		root: [
			pageToolbarDistDirpath,
			pageScriptDistDirpath,
			pageInjectionDistDirpath,
		],
		prefix: '/__tunnel/',
		// There's no need to compress the assets on the local proxy server
		preCompressed: false,
	});

	registerFastifyRoutes({
		routes,
		fastifyServer,
		routeThis: { context },
		packageSlugpath: packageSlugpaths.tunnelInstanceLocalProxyServer,
	});

	logger.debug(
		`Local proxy server listening on port ${context.state.localProjectEnvironment.localTunnelProxyServerPortNumber}; actor: ${
			JSON.stringify(context.state.actor)
		}`,
	);

	httpServer.listen({
		port:
			context.state.localProjectEnvironment.localTunnelProxyServerPortNumber,
	});

	await fastifyServer.ready();

	// This is for supporting the `tunnel share` use case (otherwise, actor is null when using the wrapper command)
	if (context.state.actor !== null) {
		// TODO: use .tunnel.json
		// const { webappTrpc } = await getWebappTrpc();
		// const { actor } = context.state;
		// const {  } = context.state.localProjectEnvironment;
		// const tunnelInstance = await webappTrpc.tunnelInstanceProxyPreview.get.query({
		// 	actor,
		// 	tunnelInstanceProxyPreview: {
		// 		user: {
		// 			id: actor.data.id
		// 		},
		// 		name
		// 	}
		// });
		// logger.debug('Tunnel instance:', tunnelInstance);
		// if (tunnelInstance !== null) {
		// 	const LocalProxy = getLocalProxy({ context });
		// 	await LocalProxy.TunnelInstanceProxyPreview.connect({
		// 		context,
		// 		tunnelInstanceProxyPreviewId: tunnelInstance._id
		// 	});
		// }
	}

	return fastifyServer;
}
