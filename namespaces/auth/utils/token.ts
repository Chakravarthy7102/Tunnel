import { RELEASE } from '@-/env/app';
import { ApiUrl } from '@-/url/api';
import { ResultAsync } from 'errok';
import { jwtDecode } from 'jwt-decode';
import ky from 'ky';

export function isAccessTokenExpired(accessToken: string) {
	const decodedToken = jwtDecode(accessToken);
	return decodedToken.exp === undefined || decodedToken.exp * 1000 < Date.now();
}

export function refreshSessionCookiesUsingAuthEndpoint() {
	return ResultAsync.fromPromise(
		ky.post(
			ApiUrl.getWebappUrl({
				fromRelease: RELEASE,
				withScheme: true,
				path: '/auth/refresh-session-cookies',
			}),
			{ throwHttpErrors: false },
		),
		(error) => error as Error,
	).map(async (response) =>
		response.json<{ accessToken: string; refreshToken: string }>()
	);
}

export function refreshTokensUsingAuthEndpoint(
	// `null` should be passed if the token is contained in an httpOnly cookie
	{ refreshToken }: { refreshToken: string },
) {
	return ResultAsync.fromPromise(
		ky.post(
			ApiUrl.getWebappUrl({
				fromRelease: RELEASE,
				withScheme: true,
				path: '/auth/refresh-tokens',
			}),
			{
				json: { refreshToken },
				throwHttpErrors: false,
			},
		),
		(error) => error as Error,
	).map((_) => null);
}
