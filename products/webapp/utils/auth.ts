import {
	createWosSessionString,
	parseWosSessionString,
	type WorkosSession,
} from '@-/auth';
import { getWorkos } from '@-/auth/workos';
import { ApiCookies } from '@-/cookies/api';
import { env } from '@-/env';
import { ApiUrl } from '@-/url/api';
import { parse as parseCookie } from 'cookie-es';
import { jwtDecode } from 'jwt-decode';
import { redirect } from 'next/navigation';
import type { NextResponse } from 'next/server';

interface CookiesLike {
	get(cookieName: string): { value: string } | null | undefined;
}

export async function getSessionFromCookie(
	cookies: CookiesLike,
	options?: { redirectOnNull: true },
): Promise<WorkosSession>;
export async function getSessionFromCookie(
	cookies: CookiesLike,
	options: { redirectOnNull: false },
): Promise<WorkosSession | null>;
export async function getSessionFromCookie(
	cookies: CookiesLike,
	options?: { redirectOnNull: boolean },
) {
	const cookie = cookies.get('wos-session');
	if (!cookie) {
		if (options?.redirectOnNull !== false) {
			return redirect('/login');
		}

		return null;
	}

	return parseWosSessionString(cookie.value);
}

interface HeadersLike {
	get(headerName: string): string | null | undefined;
}

export async function getSessionFromHeaders(headers: HeadersLike): Promise<
	{
		accessToken: string;
		workosUserId: string;
	} | null
> {
	const authorizationHeader = headers.get('authorization');
	if (!authorizationHeader) {
		const session = await getSessionFromCookie({
			get(cookieName) {
				const cookieHeader = headers.get('cookie');
				if (!cookieHeader) {
					return null;
				}

				const cookie = parseCookie(cookieHeader)[cookieName];
				if (!cookie) {
					return null;
				}

				return { value: cookie };
			},
		}, { redirectOnNull: false });

		if (session === null) {
			return null;
		}

		return { accessToken: session.accessToken, workosUserId: session.user.id };
	}

	const accessToken = authorizationHeader.replace('Bearer ', '');
	const { sub } = jwtDecode(accessToken);
	if (typeof sub !== 'string') {
		return null;
	}

	return { accessToken, workosUserId: sub };
}

export function getOauthUrls(
	{ headers, next }: { headers: Headers; next: string | null },
) {
	const workos = getWorkos();

	const githubOauthUrl = workos.userManagement.getAuthorizationUrl({
		clientId: env('NEXT_PUBLIC_WORKOS_CLIENT_ID'),
		provider: 'GitHubOAuth',
		state: JSON.stringify({ next }),
		redirectUri: ApiUrl.getWebappUrl({
			withScheme: true,
			fromHeaders: headers,
			path: '/auth/github/callback',
		}),
	});

	const googleOauthUrl = workos.userManagement.getAuthorizationUrl({
		clientId: env('NEXT_PUBLIC_WORKOS_CLIENT_ID'),
		provider: 'GoogleOAuth',
		state: JSON.stringify({ next }),
		redirectUri: ApiUrl.getWebappUrl({
			withScheme: true,
			fromHeaders: headers,
			path: '/auth/google/callback',
		}),
	});

	return {
		githubOauthUrl,
		googleOauthUrl,
	};
}

export async function setResponseAuthCookies(
	response: NextResponse,
	session: WorkosSession,
) {
	response.cookies.set({
		name: 'wos-session',
		value: await createWosSessionString(session),
		path: '/',
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
	});

	const tunnelCookies = ApiCookies.get();
	response.cookies.set({
		name: tunnelCookies.accessToken.name,
		value: session.accessToken,
		path: '/',
		httpOnly: false,
		secure: true,
		sameSite: 'lax',
	});
}
