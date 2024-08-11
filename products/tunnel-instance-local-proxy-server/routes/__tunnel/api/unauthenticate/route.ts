import type { RouteThis } from '#types';
import { ApiCookies } from '@-/cookies/api';
import type { FastifyReply, FastifyRequest } from 'fastify';

export function GET(
	this: RouteThis,
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const tunnelCookies = ApiCookies.get();

	const { redirectUrl } = request.query as {
		redirectUrl?: string;
	};

	if (redirectUrl === undefined) {
		return reply.status(400).send('Missing redirect URL');
	}

	void reply.clearCookie(tunnelCookies.accessToken.name);
	void reply.clearCookie(tunnelCookies.refreshToken.name);
	void reply.clearCookie(tunnelCookies.actorUserId.name);

	return reply.redirect(redirectUrl);
}
