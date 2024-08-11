import type { WorkosOauthException } from '#types';
import { createWosSessionString } from '#utils/session.ts';
import { getWorkos } from '#utils/workos.ts';
import { env } from '@-/env';
import { ProcedureError } from '@-/errors';
import { ApiUser } from '@-/user/api';
import { defineProcedure } from '@-/webapp/procedure-utils';
import { z } from '@-/zod';
import { $try, err, ok, ResultAsync } from 'errok';
import nullthrows from 'nullthrows-es';

export const auth_login = defineProcedure({
	input: z.object({
		email: z.string(),
		password: z.string(),
	}),
	mutation: async ({ input: { email, password } }) => ($try(async function*() {
		const workos = getWorkos();
		const sessionResult = await ResultAsync.fromPromise(
			workos.userManagement.authenticateWithPassword({
				clientId: env('NEXT_PUBLIC_WORKOS_CLIENT_ID'),
				email,
				password,
			}),
			(error) => error as WorkosOauthException,
		);

		if (sessionResult.isErr()) {
			// Handle MFA
			const errorData = sessionResult.error.rawData;
			switch (errorData.code) {
				case 'mfa_enrollment': {
					const { authenticationFactor, authenticationChallenge } =
						yield* ResultAsync.fromPromise(
							workos
								.userManagement.enrollAuthFactor({
									userId: errorData.user.id,
									type: 'totp',
									totpIssuer: 'WorkOS',
									totpUser: errorData.user.email,
								}),
							(error) => error as WorkosOauthException,
						).safeUnwrap();

					return ok({
						authenticationFactor,
						authenticationChallenge,
						pendingAuthenticationToken: errorData.pending_authentication_token,
					});
				}

				case 'mfa_challenge': {
					const challenge = yield* ResultAsync.fromPromise(
						workos.mfa.challengeFactor({
							authenticationFactorId:
								nullthrows(errorData.authentication_factors[0]).id,
						}),
						(error) => error as WorkosOauthException,
					).safeUnwrap();
					return ok({
						authenticationChallenge: challenge,
						pendingAuthenticationToken: errorData.pending_authentication_token,
					});
				}

				default: {
					return err(sessionResult.error);
				}
			}
		} else {
			const session = sessionResult.value;
			yield* ApiUser.ensureFromWorkosUser({
				input: { workosUser: session.user },
			}).safeUnwrap();

			return ok({
				wosSessionString: await createWosSessionString(session),
			});
		}
	})),
	error: ({ error }) => new ProcedureError("Couldn't login", error),
});
