import { createAuthClient } from '#utils/client.ts';
import { refreshSessionCookiesUsingAuthEndpoint } from '#utils/token.ts';
import { ApiCookies } from '@-/cookies/api';
import * as Cookies from 'es-cookie';
import onetime from 'onetime';

/**
	The webapp auth client still needs to be able to refresh tokens (e.g. when using Convex requests on the frontend), but saving tokens is handled by browser cookies instead of JavaScript logic
*/
export const getWebappAuthClient = onetime(() => {
	return createAuthClient({
		// WorkOS AuthKit's Next.js middleware should automatically refresh tokens upon API requests, so this function should just return the current tokens
		shouldAutoRefreshOnExpired: false,
		refreshTokens() {
			return refreshSessionCookiesUsingAuthEndpoint();
		},
		async loadAccessToken() {
			const tunnelCookies = ApiCookies.get();
			return Cookies.get(tunnelCookies.accessToken.name) ?? null;
		},
		// The `saveTokens` functions are no-ops because WorkOS AuthKit's Next.js middleware should automatically save access tokens and refresh tokens
		saveTokens() {},
		saveTokensSync() {},
	});
});
