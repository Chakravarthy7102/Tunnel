import { z } from '@-/zod';
import destr from 'destru';
import type { FastifyReply, FastifyRequest } from 'fastify';

export function GET(request: FastifyRequest, reply: FastifyReply) {
	const { cookies: cookiesJson, redirectUrl } = request.query as {
		cookies?: string;
		redirectUrl?: string;
	};

	if (cookiesJson === undefined) {
		return reply.status(400).send('Missing "cookies" query parameter');
	}

	if (redirectUrl === undefined) {
		return reply.status(400).send('Missing "redirectUrl" query parameter');
	}

	const result = z.record(z.string(), z.string()).safeParse(destr(cookiesJson));
	if (!result.success) {
		return reply
			.status(400)
			.send(`Invalid cookies query parameter: ${JSON.stringify(result.error)}`);
	}

	const cookies = result.data;
	for (const [cookieName, cookieValue] of Object.entries(cookies)) {
		void reply.setCookie(cookieName, cookieValue, {
			path: '/',
			sameSite: 'lax',
			secure: true,
		});
	}

	return reply.redirect(redirectUrl);
}
