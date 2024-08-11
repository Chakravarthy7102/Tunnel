import type { WorkosOauthException } from '#types';
import { getWorkos } from '#utils/workos.ts';
import { ApiConvex } from '@-/convex/api';
import { env } from '@-/env';
import { $try, err, ok, ResultAsync } from 'errok';

export const ApiAuth_authenticateWithRefreshToken = ({
	refreshToken,
}: {
	refreshToken: string;
}) => ($try(async function*() {
	const workos = getWorkos();
	const newTokensResult = await ResultAsync.fromPromise(
		workos.userManagement.authenticateWithRefreshToken({
			clientId: env('NEXT_PUBLIC_WORKOS_CLIENT_ID'),
			refreshToken,
		}),
		(error) => error as WorkosOauthException,
	);

	if (newTokensResult.isErr()) {
		// @ts-expect-error: broken types
		if (newTokensResult.error.rawData.error === 'invalid_grant') {
			// Check to see if this token is still valid
			const workosSessionTokenPair = yield* ApiConvex.v.WorkosSessionTokenPair
				.get({
					oldRefreshToken: refreshToken,
				}).safeUnwrap();

			if (workosSessionTokenPair === null) {
				return err(newTokensResult.error);
			}

			// We give already-refreshed tokens 10 seconds of leeway before they hard expire
			if (workosSessionTokenPair._creationTime + 10_000 < Date.now()) {
				return err(newTokensResult.error);
			}

			return ok({
				accessToken: workosSessionTokenPair.accessToken,
				refreshToken: workosSessionTokenPair.refreshToken,
			});
		} else {
			return err(newTokensResult.error);
		}
	}

	const newTokens = newTokensResult.value;

	yield* ApiConvex.v.WorkosSessionTokenPair.create({
		input: {
			oldRefreshToken: refreshToken,
			refreshToken: newTokens.refreshToken,
			accessToken: newTokens.accessToken,
		},
	}).safeUnwrap();
	return ok(newTokens);
}));
