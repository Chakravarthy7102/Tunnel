import { ApiCookies } from '@-/cookies/api';
import { NextResponse } from 'next/server';

export function GET(request: Request) {
	const { searchParams } = new globalThis.URL(request.url);

	const redirectUrl = searchParams.get('redirectUrl');
	if (redirectUrl === null) {
		return new Response('Missing "redirectUrl" query paramater', {
			status: 400,
		});
	}

	const tunnelCookies = ApiCookies.get();

	const headers = new Headers();
	void headers.append(
		'set-cookie',
		`${tunnelCookies.actorUserId.name}=; Path=/; SameSite=Lax; Secure; Max-Age=0`,
	);
	void headers.append(
		'set-cookie',
		`${tunnelCookies.accessToken.name}=; Path=/; SameSite=Lax; Secure; Max-Age=0`,
	);
	void headers.append(
		'set-cookie',
		`${tunnelCookies.refreshToken.name}=; Path=/; SameSite=Lax; Secure; Max-Age=0; HttpOnly`,
	);

	return NextResponse.redirect(redirectUrl, { headers });
}
