import { logger } from '@-/logger';
import { ApiUrl } from '@-/url/api';
import { z } from '@-/zod';
import destr from 'destru';
import { NextResponse } from 'next/server';

export function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const cookiesJson = searchParams.get('cookies');
	const redirectUrl = searchParams.get('redirectUrl');
	const webappUrl = ApiUrl.getWebappUrl({
		withScheme: true,
		fromHeaders: request.headers,
	});

	if (cookiesJson === null) {
		logger.debug('Missing "cookies" query parameter, redirecting...');
		return NextResponse.redirect(`${webappUrl}/home`);
	}

	if (redirectUrl === null) {
		logger.debug('Missing "redirectUrl" query parameter, redirecting...');
		return NextResponse.redirect(`${webappUrl}/home`);
	}

	const result = z
		.record(z.string(), z.string().nullable())
		.safeParse(destr(cookiesJson));
	if (!result.success) {
		logger.debug('Failed to parse cookies query parameter, redirecting...');
		return NextResponse.redirect(`${webappUrl}/home`);
	}

	const cookiesToSet = result.data;

	const headers = new Headers();
	headers.set('Location', redirectUrl);
	for (const [cookieName, cookieValue] of Object.entries(cookiesToSet)) {
		if (cookieValue === null) {
			headers.append('Set-Cookie', `${cookieName}=; Path=/; Max-Age=0;`);
		} else {
			headers.append('Set-Cookie', `${cookieName}=${cookieValue}; Path=/;`);
		}
	}

	return new Response(null, {
		status: 307,
		headers,
	});
}
