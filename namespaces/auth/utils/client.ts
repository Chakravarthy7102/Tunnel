import type { Id } from '@-/database';
import type { ResultAsync } from 'errok';
import pMemoize from 'p-memoize';
import type { Promisable } from 'type-fest';
import { isAccessTokenExpired } from './token.ts';

interface SaveTokensArgs {
	tokens: { accessToken: string; refreshToken: string };
	actorUserId: Id<'User'>;
}

export function createAuthClient({
	loadAccessToken,
	refreshTokens: refreshTokensArg,
	shouldAutoRefreshOnExpired,
	saveTokens,
	saveTokensSync,
}: {
	loadAccessToken(args: { actorUserId: Id<'User'> }): Promisable<
		string | null
	>;
	refreshTokens: (
		args: {
			actorUserId: Id<'User'>;
			/**
				The access token is required in order to de-duplicate requests
			*/
			accessToken: string;
		},
	) => ResultAsync<
		{ accessToken: string; refreshToken: string } | null,
		Error
	>;
	shouldAutoRefreshOnExpired: boolean;
	saveTokens(
		args: {
			actorUserId: Id<'User'>;
			tokens: { accessToken: string; refreshToken: string } | null;
		},
	): Promisable<void>;
	saveTokensSync(
		args: {
			actorUserId: Id<'User'>;
			tokens: { accessToken: string; refreshToken: string } | null;
		},
	): void;
}) {
	const refreshTokens = pMemoize(
		(args: { actorUserId: Id<'User'>; accessToken: string }) => {
			return refreshTokensArg(args);
		},
		{ cacheKey: (args) => args[0].accessToken },
	);

	return {
		async getAccessToken(
			{ actorUserId, forceRefresh }: {
				actorUserId: Id<'User'>;
				forceRefresh?: boolean;
			},
		): Promise<string | null> {
			const accessToken = await loadAccessToken({ actorUserId });
			if (accessToken === null) {
				await saveTokens({ actorUserId, tokens: null });
				return null;
			}

			// If the token has expired, attempt to refresh it
			if (
				Boolean(forceRefresh) ||
				(shouldAutoRefreshOnExpired &&
					isAccessTokenExpired(accessToken))
			) {
				const refreshTokensResult = await refreshTokens({
					actorUserId,
					accessToken,
				});

				if (refreshTokensResult.isErr()) {
					await saveTokens({ actorUserId, tokens: null });
					return null;
				}

				const refreshedTokens = refreshTokensResult.value;
				if (refreshedTokens !== null) {
					await saveTokens({
						actorUserId,
						tokens: refreshedTokens,
					});
				}
			}

			return accessToken;
		},
		async setTokens({ tokens, actorUserId }: {
			tokens: { accessToken: string; refreshToken: string };
			actorUserId: Id<'User'>;
		}) {
			await saveTokens({ actorUserId, tokens });
		},
		setTokensSync({ tokens, actorUserId }: SaveTokensArgs) {
			saveTokensSync({ actorUserId, tokens });
		},
	};
}
