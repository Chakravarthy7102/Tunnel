import { createAuthClient } from '#utils/client.ts';
import { refreshTokensUsingAuthEndpoint } from '#utils/token.ts';
import { getCliStorage } from '@-/cli-storage';
import { $try, err, ok } from 'errok';
import { excludeKeys } from 'filter-obj';
import onetime from 'onetime';

export const getCliAuthClient = onetime(() => {
	const cliStorage = getCliStorage();
	return createAuthClient({
		shouldAutoRefreshOnExpired: true,
		refreshTokens: ({ actorUserId }) => ($try(async function*() {
			const { savedActorsData } = await cliStorage.get();
			const savedActorData = savedActorsData[`User|${actorUserId}`];
			if (savedActorData === undefined) {
				return err(new Error('No tokens found'));
			}

			const { refreshToken } = savedActorData;
			const tokens = yield* refreshTokensUsingAuthEndpoint({ refreshToken })
				.safeUnwrap();
			return ok(tokens);
		})),
		async loadAccessToken({ actorUserId }) {
			const { savedActorsData } = await cliStorage.get();
			const savedActorData = savedActorsData[`User|${actorUserId}`];
			if (savedActorData === undefined) {
				return null;
			}

			return savedActorData.accessToken;
		},
		async saveTokens({ actorUserId, tokens }) {
			if (tokens === null) {
				await cliStorage.set((data) => ({
					...data,
					currentActorString: null,
					savedActorsData: excludeKeys(data.savedActorsData, [
						`User|${actorUserId}`,
					]),
				}));
			} else {
				await cliStorage.set((data) => ({
					...data,
					currentActorString: `User|${actorUserId}`,
					savedActorsData: {
						...data.savedActorsData,
						[`User|${actorUserId}`]: {
							actor: {
								type: 'User',
								data: { id: actorUserId },
							},
							accessToken: tokens.accessToken,
							refreshToken: tokens.refreshToken,
						},
					},
				}));
			}
		},
		saveTokensSync() {
			throw new Error('saveTokensSync is not implemented for CLI auth client');
		},
	});
});
