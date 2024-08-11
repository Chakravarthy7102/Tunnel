import { tunnelApiRouter } from '#utils/api.ts';
import { getSessionFromHeaders } from '#utils/auth.ts';
import { createContext } from '#utils/context.server.ts';
import { getErrorMessage, logger } from '@-/logger';
import { SuperJSON } from '@-/superjson';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { type NextRequest, NextResponse } from 'next/server';

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
	'Access-Control-Allow-Credentials': 'true',
	'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const handler = async (request: NextRequest) => {
	const session = await getSessionFromHeaders(request.headers);

	return new Promise<Response>((resolve, reject) => {
		fetchRequestHandler({
			endpoint: '/api/trpc',
			req: request,
			router: tunnelApiRouter,
			createContext: async () =>
				createContext({
					workosUserId: session?.workosUserId ?? null,
					headers: request.headers,
					accessToken: session?.accessToken ?? null,
				}),
			responseMeta(opts) {
				const data = opts.data[0];
				if (
					data !== undefined &&
					'result' in data &&
					typeof data.result === 'object' &&
					typeof data.result.data === 'object' &&
					data.result.data !== null &&
					'isErr' in data.result.data &&
					typeof data.result.data.isErr === 'function' &&
					data.result.data.isErr() &&
					'error' in data.result.data
				) {
					logger.error(
						`tRPC request to "${opts.paths?.[0] ?? '<unknown>'}" failed with:`,
						data.result.data.error,
					);
					return { status: 400 };
				}

				return {};
			},
			/**
				This isn't invoked for when we return an Err value
			*/
			onError({ error, path }) {
				logger.error(
					`@-/webapp tRPC error${path === undefined ? '' : ` ${path}`}:`,
					error,
				);

				resolve(
					NextResponse.json(
						{
							id: null,
							error: SuperJSON.serialize({
								message: getErrorMessage(error),
								code: -32_600,
								data: {
									code: 'INTERNAL_SERVER_ERROR',
									httpStatus: 500,
									path,
								},
							}),
						},
						{
							status: 500,
							headers: corsHeaders,
						},
					),
				);
			},
		})
			.then((response) => {
				resolve(
					new Response(response.body, {
						status: response.status,
						headers: {
							...Object.fromEntries(response.headers),
							'Access-Control-Allow-Origin': '*',
							'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
							'Access-Control-Allow-Headers': '*',
						},
					}),
				);
			})
			.catch(reject);
	});
};

export function OPTIONS() {
	return new Response(null, {
		headers: corsHeaders,
	});
}

export { handler as GET, handler as POST };
