import { NodeLoaderTrpcConnection } from '#classes/_.ts';
import type { RouteThis } from '#types';
import { SuperJSON } from '@-/superjson';
import { createId } from '@paralleldrive/cuid2';
import destr from 'destru';
import type { FastifyReply, FastifyRequest } from 'fastify';

async function _handler(
	this: RouteThis,
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const { context } = this;
	const { port: portString, path } = request.params as {
		port: string;
		path: string;
	};
	const port = Number(portString);
	if (Number.isNaN(port)) {
		return reply.status(400).send('Invalid port');
	}

	const { query } = request;
	if (query === null || !(typeof query === 'object' && 'input' in query)) {
		return reply.status(400).send('Invalid query');
	}

	const requestId = createId();

	const trpcConnection = NodeLoaderTrpcConnection.getOrCreate({
		port,
		context,
	});
	await trpcConnection.sendRequest({
		id: requestId,
		method: request.method === 'GET' ? 'query' : 'mutation',
		params: {
			path,
			// Input is already `SuperJSON.stringify`'d
			input: query.input,
		},
	});
	const responses = await trpcConnection.getResponses({ requestId });

	// We merge the responses from all instrumentation servers into one response
	const mergedStringifiedData = SuperJSON.stringify(
		responses.map((response) => SuperJSON.parse(response.result.data)),
	);

	await reply.send({
		result: {
			data: destr(mergedStringifiedData),
		},
	});
}

export { _handler as GET, _handler as POST };
