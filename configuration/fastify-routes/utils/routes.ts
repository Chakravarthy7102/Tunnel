import { logger } from '@-/logger';
import type { FastifyInstance, HTTPMethods } from 'fastify';
import path from 'pathe';

export function registerFastifyRoutes({
	fastifyServer,
	routes,
	packageSlugpath,
	routeThis,
}: {
	fastifyServer: FastifyInstance;
	routes: unknown;
	packageSlugpath: string;
	routeThis?: unknown;
}) {
	if (routes === null || typeof routes !== 'object') {
		throw new TypeError('invalid routes argument');
	}

	for (const [routeRelativeFilepath, route] of Object.entries(routes)) {
		if (route.enabled === false) {
			continue;
		}

		const options = typeof route === 'object' &&
				route !== null &&
				'options' in route &&
				typeof route.options === 'object' &&
				route.options !== null ?
			route.options :
			{};

		for (const [key, value] of Object.entries(route)) {
			const method = key;
			const handler = value;

			if (key === 'enabled' || method === 'WS') {
				continue;
			}

			const routesDirpath = path.join(packageSlugpath, 'routes');

			const url = '/' +
				path.dirname(
					path
						.relative(routesDirpath, routeRelativeFilepath)
						.replaceAll(/\[(.*?)]/g, ':$1'),
				);

			if (typeof handler !== 'function') {
				logger.warn(
					`Route handler exported from "${routeRelativeFilepath}" is not a function, skipping...`,
				);
				continue;
			}

			if (method !== 'GET' && method !== 'POST') {
				logger.warn(
					`${method.toUpperCase()} handler exported from "${routeRelativeFilepath}" is not supported, skipping...`,
				);
				continue;
			}

			void fastifyServer.route({
				method: method as HTTPMethods,
				url,
				handler: handler.bind(routeThis),
				...options,
			});
		}
	}
}
