import type { WorkosOauthException } from '#types';
import { createWosSessionString } from '#utils/session.ts';
import { getWorkos } from '#utils/workos.ts';
import { env } from '@-/env';
import { ProcedureError } from '@-/errors';
import { ApiUrl } from '@-/url/api';
import { defineProcedure } from '@-/webapp/procedure-utils';
import { z } from '@-/zod';
import { $try, ok, ResultAsync } from 'errok';

export const auth_sendResetPasswordEmail = defineProcedure({
	input: z.object({
		email: z.string(),
	}),
	mutation: async ({ input: { email }, ctx }) => ($try(async function*() {
		const workos = getWorkos();
		yield* ResultAsync.fromPromise(
			workos.userManagement.sendPasswordResetEmail({
				email,
				passwordResetUrl: `${
					ApiUrl.getWebappUrl({
						fromHeaders: ctx.headers,
						withScheme: true,
					})
				}/reset-password?email=${email}`,
			}),
			(error) => error as WorkosOauthException,
		).safeUnwrap();
		return ok();
	})),
	error: ({ error }) =>
		new ProcedureError("Couldn't send password reset email", error),
});

export const auth_resetPassword = defineProcedure({
	input: z.object({
		newPassword: z.string(),
		token: z.string(),
	}),
	mutation: async (
		{ input: { newPassword, token } },
	) => ($try(async function*() {
		const workos = getWorkos();
		const { user } = yield* ResultAsync.fromPromise(
			workos.userManagement.resetPassword({
				newPassword,
				token,
			}),
			(error) => error as WorkosOauthException,
		).safeUnwrap();

		const session = yield* ResultAsync.fromPromise(
			workos.userManagement.authenticateWithPassword({
				clientId: env('NEXT_PUBLIC_WORKOS_CLIENT_ID'),
				email: user.email,
				password: newPassword,
			}),
			(error) => error as WorkosOauthException,
		).safeUnwrap();

		return ok({
			wosSessionString: await createWosSessionString(session),
		});
	})),
	error: ({ error }) => new ProcedureError("Couldn't reset password", error),
});
