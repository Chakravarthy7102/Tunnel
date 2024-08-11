import { TunnelConvexHttpClient } from '#utils/client.ts';
import { getConvexUrlFromEnvironment } from '#utils/url.ts';
import { env } from '@-/env';

export const ApiConvex_get = (options?: { token: string }) => {
	const CONVEX_SECRET = env('CONVEX_SECRET');
	const convexUrl = getConvexUrlFromEnvironment();
	const http = new TunnelConvexHttpClient(
		convexUrl,
		options?.token ?? null,
		CONVEX_SECRET,
	);
	return http;
};
