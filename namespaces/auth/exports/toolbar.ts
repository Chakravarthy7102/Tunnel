import { createAuthClient } from '#utils/client.ts';
import { refreshTokensUsingAuthEndpoint } from '#utils/token.ts';
import type { Id } from '@-/database';
import { getTunnelInstancePageSecretStorage } from '@-/tunnel-instance-page-secret-storage';
import { errAsync } from 'errok';
import onetime from 'onetime';

/**
	The toolbar auth client needs to be a singleton so that POST requests to "/auth/refresh-tokens"
	are de-duplicated
*/
export const getToolbarAuthClient = onetime(() => {
	const tunnelInstancePageSecretStorage = getTunnelInstancePageSecretStorage();
	return createAuthClient({
		shouldAutoRefreshOnExpired: true,
		refreshTokens({ actorUserId }: {
			actorUserId: Id<'User'>;
		}) {
			const { refreshToken, actorUserId: savedActorUserId } =
				tunnelInstancePageSecretStorage.getSync();
			if (savedActorUserId !== actorUserId || refreshToken === null) {
				return errAsync(new Error('No session found'));
			}

			return refreshTokensUsingAuthEndpoint({ refreshToken });
		},
		async loadAccessToken({ actorUserId }) {
			const { accessToken, actorUserId: savedActorUserId } =
				await tunnelInstancePageSecretStorage.get();
			if (savedActorUserId !== actorUserId) {
				return null;
			}

			return accessToken;
		},
		async saveTokens({ actorUserId, tokens }) {
			if (tokens === null) {
				await tunnelInstancePageSecretStorage.set({
					accessToken: null,
					actorUserId: null,
					refreshToken: null,
				});
			} else {
				await tunnelInstancePageSecretStorage.set({
					accessToken: tokens.accessToken,
					actorUserId,
					refreshToken: tokens.refreshToken,
				});
			}
		},
		saveTokensSync({ actorUserId, tokens }) {
			if (tokens === null) {
				tunnelInstancePageSecretStorage.setSync({
					accessToken: null,
					actorUserId,
					refreshToken: null,
				});
			} else {
				tunnelInstancePageSecretStorage.setSync({
					accessToken: tokens.accessToken,
					actorUserId,
					refreshToken: tokens.refreshToken,
				});
			}
		},
	});
});
