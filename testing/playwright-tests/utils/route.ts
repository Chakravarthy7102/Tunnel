import mapObject, { mapObjectSkip } from 'map-obj';
import type { Page, Request, Route } from 'playwright';
import { createRouter } from 'radix3';
import safeUrl from 'safer-url';
import type { Promisable } from 'type-fest';
import type { Mock } from 'vitest';
import { makeTrpcResponse } from './trpc.ts';

const httpMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;
type HttpMethods = typeof httpMethods[number];

export async function registerRouteMocks<
	$RouteHandlers extends Record<
		string,
		Record<
			`${HttpMethods} /${string}`,
			(route: Route, request: Request) => Promisable<any>
		>
	>,
>(page: Page, routeHandlers: $RouteHandlers): Promise<
	{
		[$Url in keyof $RouteHandlers]: {
			[$Route in keyof $RouteHandlers[$Url]]: Mock<
				// @ts-expect-error: works
				Parameters<$RouteHandlers[$Url][$Route]>,
				// @ts-expect-error: works
				ReturnType<$RouteHandlers[$Url][$Route]>
			>;
		};
	}
> {
	const routeMockFunctions: any = {};
	for (const [baseUrlString, routes] of Object.entries(routeHandlers)) {
		const baseUrl = safeUrl(baseUrlString);
		if (baseUrl === null) {
			throw new Error(`Invalid URL: ${baseUrl}`);
		}

		const routers = Object.fromEntries(httpMethods.map((httpMethod) => [
			httpMethod,
			createRouter({
				routes: mapObject(
					routes,
					(methodAndRoute, value) => {
						const [method, route] = methodAndRoute.split(' ');
						if (method !== httpMethod) {
							return mapObjectSkip;
						}

						if (route === undefined) {
							throw new Error(
								`Route not found for ${methodAndRoute}`,
							);
						}

						routeMockFunctions[baseUrlString] ??= {};
						routeMockFunctions[baseUrlString][route] = value;
						return [baseUrl.pathname.replace('/*', route), {
							handler: value,
						}];
					},
				),
			}),
		]));
		// eslint-disable-next-line no-await-in-loop -- We want to register these in order
		await page.route(
			baseUrlString,
			async (route, request) => {
				const requestUrl = safeUrl(request.url());

				if (requestUrl === null) {
					await route.continue();
					return;
				}

				// Check if a route function exists for this request
				const matchedRoute = routers[request.method()]?.lookup(
					requestUrl.pathname,
				);

				if (matchedRoute === null) {
					await route.continue();
				} else {
					const response = await (matchedRoute as any).handler(route);
					if (baseUrlString === 'https://tunnel.test/api/trpc/*') {
						await route.fulfill({ json: makeTrpcResponse(response) });
					} else {
						await route.fulfill({ json: response });
					}
				}
			},
		);
	}

	return routeMockFunctions;
}
