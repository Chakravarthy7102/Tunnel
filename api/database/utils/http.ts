import { type ActionCtx, httpAction } from '#convex/_generated/server.js';
import { createActionVctx } from './ctx.ts';

export function defineHttpAction(
	handler: (ctx: ActionCtx, request: Request) => Promise<Response>,
) {
	return httpAction(async (ctx, request) => (handler(
		createActionVctx(ctx),
		request,
	)));
}

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST',
	'Access-Control-Allow-Headers': 'Content-Type, Digest',
	'Access-Control-Max-Age': '86400',
};

export const createCorsHeaders = () => new Headers(corsHeaders);
