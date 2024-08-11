import type { RouteThis } from '#types';
import { ApiCookies } from '@-/cookies/api';
import type { FastifyReply, FastifyRequest } from 'fastify';

export function GET(
	this: RouteThis,
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const tunnelCookies = ApiCookies.get();

	const { redirectUrl, accessToken, refreshToken, actorUserId } = request
		.query as {
			redirectUrl?: string;
			accessToken?: string;
			refreshToken?: string;
			actorUserId?: string;
		};

	if (accessToken === undefined) {
		return reply
			.status(400)
			.send('Missing "accessToken" query parameter');
	}

	if (refreshToken === undefined) {
		return reply
			.status(400)
			.send('Missing "refreshToken" query parameter');
	}

	if (actorUserId === undefined) {
		return reply.status(400).send('Missing "actorUserId" query parameter');
	}

	if (redirectUrl === undefined) {
		return reply.status(400).send('Missing redirect URL');
	}

	const cookieOptions = {
		path: '/',
		sameSite: 'lax' as const,
		secure: true,
	};

	void reply.setCookie(
		tunnelCookies.accessToken.name,
		accessToken,
		cookieOptions,
	);
	void reply.setCookie(
		tunnelCookies.refreshToken.name,
		refreshToken,
		{ ...cookieOptions, httpOnly: true },
	);
	void reply.setCookie(
		tunnelCookies.actorUserId.name,
		actorUserId,
		cookieOptions,
	);

	return reply.redirect(redirectUrl);
}
