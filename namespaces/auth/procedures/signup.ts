import type { WorkosOauthException } from '#types';
import { createWosSessionString } from '#utils/session.ts';
import { getWorkos } from '#utils/workos.ts';
import { env } from '@-/env';
import { ProcedureError } from '@-/errors';
import { logger } from '@-/logger';
import { ApiUser } from '@-/user/api';
import { defineProcedure } from '@-/webapp/procedure-utils';
import { z } from '@-/zod';
import { $try, err, ok, ResultAsync } from 'errok';

export const auth_signUpWithEmailPassword = defineProcedure({
	input: z.object({
		email: z.string(),
		password: z.string(),
	}),
	mutation: async ({ input: { email, password } }) => ($try(async function*() {
		const workos = getWorkos();
		const workosUser = yield* ResultAsync.fromPromise(
			workos.userManagement.createUser({
				email,
				password,
				// We want the user to verify their email address before they can log in
				// since it makes the product feel more legit
				emailVerified: false,
			}),
			(error) => error as WorkosOauthException,
		).safeUnwrap();
		const userResult = await ApiUser.ensureFromWorkosUser({
			input: { workosUser },
		});
		if (userResult.isErr()) {
			const deleteResult = await ResultAsync.fromPromise(
				workos.userManagement.deleteUser(workosUser.id),
				(error) => error as WorkosOauthException,
			);
			if (deleteResult.isErr()) {
				logger.error(
					'Failed to delete WorkOS user after an error occurred while creating the Tunnel user:',
					deleteResult.error,
				);
			}

			return err(userResult.error);
		}

		// We still need to call `authenticateWithPassword` (even though we expect it to error with an unverified email) to get the `pending_authentication_code` we use during email verification
		const sessionResult = await ResultAsync.fromPromise(
			workos.userManagement.authenticateWithPassword({
				clientId: env('NEXT_PUBLIC_WORKOS_CLIENT_ID'),
				email,
				password,
			}),
			(error) => error as WorkosOauthException,
		);

		// But, in case the email is already verified for some reason, we should proceed with authenticating the user
		if (sessionResult.isOk()) {
			return ok({
				status: 'authenticated' as const,
				wosSessionString: await createWosSessionString(sessionResult.value),
			});
		} else {
			if (sessionResult.error.rawData.code === 'email_verification_required') {
				return ok({
					status: 'email_verification_required' as const,
					pendingAuthenticationToken:
						sessionResult.error.rawData.pending_authentication_token,
					workosUserId: workosUser.id,
				});
			} else {
				return err(sessionResult.error);
			}
		}
	})),
	error: ({ error }) =>
		new ProcedureError("Couldn't create a new account", error),
});
