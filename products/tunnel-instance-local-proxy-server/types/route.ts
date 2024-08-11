import type { LocalProxyContext } from '#types';
import type { FastifyInstance } from 'fastify';

export interface RouteThis {
	context: LocalProxyContext;
	fastifyServer: FastifyInstance;
}
