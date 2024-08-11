import type { PageToolbarContext } from '#types';
import { getToolbarAuthClient } from '@-/auth/toolbar';
import { getTunnelInstancePageSecretStorage } from '@-/tunnel-instance-page-secret-storage';
import { useCallback, useMemo } from 'react';
import { useContextStore } from './context/use.ts';

const authClient = getToolbarAuthClient();

export function getUseWorkosAuth(
	{ context }: { context: PageToolbarContext },
) {
	const tunnelInstancePageSecretStorage = getTunnelInstancePageSecretStorage();
	return function useWorkosAuth() {
		const isAuthenticated =
			tunnelInstancePageSecretStorage.getSync().accessToken !== null;
		const { actor } = useContextStore(context);

		const fetchAccessToken = useCallback(
			async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
				if (actor === null) {
					return null;
				}

				const accessToken = await authClient.getAccessToken({
					forceRefresh: forceRefreshToken,
					actorUserId: actor.data.id,
				});

				return accessToken;
			},
			[actor],
		);
		return useMemo(
			() => ({
				isLoading: false,
				isAuthenticated,
				fetchAccessToken,
			}),
			[isAuthenticated, fetchAccessToken],
		);
	};
}
