import type { RouteThis } from '#types';
import { localProxyApiRouter } from '#utils/api.ts';
import { fastifyRequestHandler } from '@trpc/server/adapters/fastify';
import type { FastifyReply, FastifyRequest } from 'fastify';

/**
	This route is for clients who want to make a request to the instrumentation API.

	Under the hood, this forwards all requests using a websocket connection between the CLI and the instrumentation server that's running from the application's Node loader.
*/
async function _handler(
	this: RouteThis,
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const trpcOptions = {
		router: localProxyApiRouter,
		createContext: () => ({
			context: this.context,
		}),
	};

	const { path } = request.params as { path: string };
	await fastifyRequestHandler({
		...trpcOptions,
		req: request,
		res: reply,
		path,
	});
}

export { _handler as GET, _handler as POST };
