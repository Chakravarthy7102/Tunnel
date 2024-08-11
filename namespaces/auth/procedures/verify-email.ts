import type { WorkosOauthException } from '#types';
import { createWosSessionString } from '#utils/session.ts';
import { getWorkos } from '#utils/workos.ts';
import { createCid } from '@-/database';
import { env } from '@-/env';
import { ProcedureError } from '@-/errors';
import { defineProcedure } from '@-/webapp/procedure-utils';
import { z } from '@-/zod';
import { $try, ok, ResultAsync } from 'errok';
import { randomInt } from 'node:crypto';
import { setTimeout } from 'node:timers/promises';

export const auth_sendVerificationEmail = defineProcedure({
	input: z.object({
		email: z.string(),
	}),
	mutation: async ({ input: { email } }) => ($try(async function*() {
		const workos = getWorkos();
		const users = await workos.userManagement.listUsers({ email });
		const user = users.data[0];

		if (user === undefined) {
			// We delay for an arbitrary amount of time to prevent timing attacks
			await setTimeout(randomInt(500, 2000));
			return ok({ workosUserId: `user_${createCid()}` });
		}

		yield* ResultAsync.fromPromise(
			workos.userManagement.sendVerificationEmail({ userId: user.id }),
			(error) => error as WorkosOauthException,
		).safeUnwrap();

		return ok({ workosUserId: user.id });
	})),
	error: ({ error }) =>
		new ProcedureError("Couldn't send verification email", error),
});

export const auth_verifyEmail = defineProcedure({
	input: z.object({
		workosUserId: z.string(),
		code: z.string(),
	}),
	mutation: async (
		{ input: { workosUserId, code } },
	) => ($try(async function*() {
		const workos = getWorkos();
		yield* ResultAsync.fromPromise(
			workos.userManagement.verifyEmail({
				userId: workosUserId,
				code,
			}),
			(error) => error as WorkosOauthException,
		).safeUnwrap();
		return ok();
	})),
	error: ({ error }) => new ProcedureError("Couldn't verify email", error),
});

export const auth_verifyEmailAndAuthenticate = defineProcedure({
	input: z.object({
		code: z.string(),
		pendingAuthenticationToken: z.string(),
	}),
	mutation: async (
		{ input: { code, pendingAuthenticationToken } },
	) => ($try(async function*() {
		const workos = getWorkos();
		const session = yield* ResultAsync.fromPromise(
			workos.userManagement.authenticateWithEmailVerification({
				clientId: env('NEXT_PUBLIC_WORKOS_CLIENT_ID'),
				code,
				pendingAuthenticationToken,
			}),
			(error) => error as WorkosOauthException,
		).safeUnwrap();
		return ok({
			wosSessionString: await createWosSessionString(session),
		});
	})),
	error: ({ error }) => new ProcedureError("Couldn't verify email", error),
});
