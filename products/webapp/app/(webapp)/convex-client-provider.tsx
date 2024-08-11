'use client';

import { getWebappAuthClient } from '@-/auth/webapp';
import { getConvexUrlFromEnvironment } from '@-/convex';
import { ConvexProviderWithAuth, ConvexReactClient } from '@-/convex/react';
import { ApiCookies } from '@-/cookies/api';
import type { Id } from '@-/database';
import * as Cookies from 'es-cookie';
import { type PropsWithChildren, useCallback, useMemo } from 'react';

const authClient = getWebappAuthClient();

function useAuthFromWorkos() {
	const tunnelCookies = ApiCookies.get();
	const accessToken = typeof window === 'undefined' ?
		null :
		Cookies.get(tunnelCookies.accessToken.name) ?? null;

	const fetchAccessToken = useCallback(
		async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
			const accessToken = await authClient.getAccessToken({
				forceRefresh: forceRefreshToken,
				actorUserId: '' as Id<'User'>,
			});

			return accessToken;
		},
		[],
	);

	return useMemo(
		() => ({
			isLoading: false,
			isAuthenticated: accessToken !== null,
			fetchAccessToken,
		}),
		[accessToken, fetchAccessToken],
	);
}

export const convexReactClient = new ConvexReactClient(
	getConvexUrlFromEnvironment(),
);

export function TunnelConvexProviderWithWorkos(
	{ children }: PropsWithChildren,
) {
	return (
		<ConvexProviderWithAuth
			client={convexReactClient}
			useAuth={useAuthFromWorkos}
		>
			{children}
		</ConvexProviderWithAuth>
	);
}
