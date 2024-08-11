import type { HttpRouter } from 'convex/server';

export function defineRoute(
	http: HttpRouter,
	options: Parameters<HttpRouter['route']>[0],
) {
	return http.route(options);
}
