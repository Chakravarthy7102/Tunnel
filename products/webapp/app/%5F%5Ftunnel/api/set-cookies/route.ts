import { z } from '@-/zod';
import destr from 'destru';
import { NextResponse } from 'next/server';

export function GET(request: Request) {
	const { searchParams } = new globalThis.URL(request.url);

	const redirectUrl = searchParams.get('redirectUrl');
	if (redirectUrl === null) {
		return new Response('Missing "redirectUrl" query paramater', {
			status: 400,
		});
	}

	const cookiesJson = searchParams.get('cookies');
	if (cookiesJson === null) {
		return new Response('Missing "cookies" query parameter', {
			status: 400,
		});
	}

	const result = z.record(z.string(), z.string()).safeParse(
		destr(cookiesJson),
	);
	if (!result.success) {
		return new Response('Invalid cookies query parameter', { status: 400 });
	}

	const cookies = result.data;
	const headers = new Headers();
	for (const [cookieName, cookieValue] of Object.entries(cookies)) {
		headers.append(
			'set-cookie',
			`${cookieName}=${cookieValue}; Path=/; SameSite=Lax; Secure`,
		);
	}

	return NextResponse.redirect(redirectUrl, { headers });
}
