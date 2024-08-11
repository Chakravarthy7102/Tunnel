import {
	createWosSessionString,
	parseWosSessionString,
	type WorkosOauthException,
} from '@-/auth';
import { getWorkos } from '@-/auth/workos';
import type { ServerDoc } from '@-/database';
import { getVapi } from '@-/database/vapi';
import { env } from '@-/env';
import { $try, err, ok, ResultAsync } from 'errok';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { type NextRequest, NextResponse } from 'next/server';

export default authkitMiddleware();

export const config = {
	matcher: [
		// Matches all routes that don't end in a file extension or contain `_next` or `__tunnel`
		'/((?!.+\\.[\\w]+$|_next|__tunnel|api/__tunnel).*)',
		'/',
		'/((?:api(?!/__tunnel|tunnel))|trpc)(.*)',
	],
};

// Most of the below code was copied from `./node_modules/@workos-inc/authkit-nextjs/dist/cjs/session.js`
const workos = getWorkos();

function authkitMiddleware({ debug = false } = {}) {
	return async function middleware(request: NextRequest) {
		return updateSession(request, debug);
	};
}

const sessionHeaderName = 'x-workos-session';
const middlewareHeaderName = 'x-workos-middleware';
const cookieName = 'wos-session';
const cookieOptions = {
	path: '/',
	httpOnly: true,
	secure: true,
	sameSite: 'lax' as const,
};

async function updateSession(request: NextRequest, debug: boolean) {
	const wosSessionString = request.cookies.get(cookieName)?.value ?? null;
	const session = wosSessionString === null ?
		null :
		await parseWosSessionString(wosSessionString);

	const newRequestHeaders = new Headers(request.headers);
	// We store the current request url in a custom header, so we can always have access to it
	// This is because on hard navigations we don't have access to `next-url` but need to get the current
	// `pathname` to be able to return the users where they came from before sign-in
	newRequestHeaders.set('x-url', request.url);
	// Record that the request was routed through the middleware so we can check later for DX purposes
	newRequestHeaders.set(middlewareHeaderName, 'true');
	newRequestHeaders.delete(sessionHeaderName);
	// If no session, just continue
	if (!session) {
		return NextResponse.next({
			request: { headers: newRequestHeaders },
		});
	}

	const hasValidSession = await verifyAccessToken(session.accessToken);
	if (hasValidSession) {
		if (debug) {
			console.log('Session is valid');
		}

		// set the x-workos-session header according to the current cookie value
		newRequestHeaders.set(
			sessionHeaderName,
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- Guaranteed to be non-null
			request.cookies.get(cookieName)!.value,
		);
		return NextResponse.next({
			request: { headers: newRequestHeaders },
		});
	}

	if (debug) {
		console.log('Session invalid. Attempting refresh', session.refreshToken);
	}

	// If the session is invalid (i.e. the access token has expired) attempt to re-authenticate with the refresh token
	const newTokensResult = await authenticateWithRefreshToken({
		refreshToken: session.refreshToken,
	});

	if (newTokensResult.isOk()) {
		const { accessToken, refreshToken } = newTokensResult.value;
		if (debug) {
			console.log('Refresh successful:', refreshToken);
		}

		// Encrypt session with new access and refresh tokens
		const encryptedSession = await createWosSessionString({
			accessToken,
			refreshToken,
			user: session.user,
			impersonator: session.impersonator,
		});
		newRequestHeaders.set(sessionHeaderName, encryptedSession);
		const response = NextResponse.next({
			request: { headers: newRequestHeaders },
		});
		// update the cookie
		response.cookies.set(
			cookieName,
			encryptedSession,
			cookieOptions,
		);
		return response;
	} else {
		console.warn('Failed to refresh', newTokensResult.error);
		const response = NextResponse.next({
			request: { headers: newRequestHeaders },
		});
		response.cookies.delete(cookieName);
		return response;
	}
}

const JWKS = createRemoteJWKSet(
	new URL(
		workos.userManagement.getJwksUrl(env('NEXT_PUBLIC_WORKOS_CLIENT_ID')),
	),
);

async function verifyAccessToken(accessToken: string) {
	try {
		await jwtVerify(accessToken, JWKS);
		return true;
	} catch (error: any) {
		if (error.code !== 'ERR_JWT_EXPIRED') {
			console.warn('Failed to verify session:', error);
		}

		return false;
	}
}

// This function is mostly copied from `ApiAuth_authenticateWithRefreshToken`
// but rewritten to use `fetch` instead of `ApiConvex`
export const authenticateWithRefreshToken = ({
	refreshToken,
}: {
	refreshToken: string;
}) => ($try(async function*() {
	const newTokensResult = await ResultAsync.fromPromise(
		workos.userManagement.authenticateWithRefreshToken({
			clientId: env('NEXT_PUBLIC_WORKOS_CLIENT_ID'),
			refreshToken,
		}),
		(error) => error as WorkosOauthException,
	);

	if (newTokensResult.isOk()) {
		try {
			const vapi = await getVapi();
			await fetch(
				`${process.env.CONVEX_URL}/api/mutation`,
				{
					method: 'POST',
					body: JSON.stringify({
						path:
							(vapi.v.WorkosSessionTokenPair_create as any)[
								Symbol.for('functionName')
							],
						args: {
							oldRefreshToken: refreshToken,
							refreshToken: newTokensResult.value.refreshToken,
							accessToken: newTokensResult.value.accessToken,
							hash: env('CONVEX_SECRET'),
						},
						format: 'json',
					}),
					headers: {
						'Content-Type': 'application/json',
					},
				},
			);
		} catch (error) {
			console.error('Failed to update tokens:', error);
		}

		return ok(newTokensResult.value);
	}

	// @ts-expect-error: broken types
	if (newTokensResult.error.rawData.error === 'invalid_grant') {
		const vapi = await getVapi();

		// Check to see if this token is still valid
		const workosSessionTokenPairResponse = await fetch(
			`${process.env.CONVEX_URL}/api/query`,
			{
				method: 'POST',
				body: JSON.stringify({
					// @ts-expect-error: broken types
					path: vapi.v.WorkosSessionTokenPair_get[Symbol.for('functionName')],
					args: {
						oldRefreshToken: refreshToken,
						hash: env('CONVEX_SECRET'),
					},
					format: 'json',
				}),
				headers: {
					'Content-Type': 'application/json',
				},
			},
		);
		const workosSessionTokenPairJson = await workosSessionTokenPairResponse
			.json() as { status: 'error' } | {
				status: 'success';
				value: ServerDoc<'WorkosSessionTokensPair'> | null;
			};

		console.log(workosSessionTokenPairJson);

		if (
			workosSessionTokenPairJson.status === 'error' ||
			workosSessionTokenPairJson.value === null
		) {
			return err(newTokensResult.error);
		}

		// We give already-refreshed tokens 10 seconds of leeway before they hard expire
		if (
			workosSessionTokenPairJson.value._creationTime + 10_000 < Date.now()
		) {
			return err(newTokensResult.error);
		}

		return ok({
			accessToken: workosSessionTokenPairJson.value.accessToken,
			refreshToken: workosSessionTokenPairJson.value.refreshToken,
		});
	} else {
		return err(newTokensResult.error);
	}
}));
