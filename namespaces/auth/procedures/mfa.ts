import type { WorkosOauthException } from '#types';
import { createWosSessionString } from '#utils/session.ts';
import { getWorkos } from '#utils/workos.ts';
import { env } from '@-/env';
import { ProcedureError } from '@-/errors';
import { ApiUser } from '@-/user/api';
import { defineProcedure } from '@-/webapp/procedure-utils';
import { z } from '@-/zod';
import { $try, ok, ResultAsync } from 'errok';

export const auth_verifyTotp = defineProcedure({
	input: z.object({
		authenticationChallengeId: z.string(),
		pendingAuthenticationToken: z.string(),
		code: z.string(),
	}),
	mutation: async (
		{ input: { code, authenticationChallengeId, pendingAuthenticationToken } },
	) => ($try(async function*() {
		const workos = getWorkos();
		const session = yield* ResultAsync.fromPromise(
			workos.userManagement.authenticateWithTotp({
				clientId: env('NEXT_PUBLIC_WORKOS_CLIENT_ID'),
				authenticationChallengeId,
				pendingAuthenticationToken,
				code,
			}),
			(error) => error as WorkosOauthException,
		).safeUnwrap();
		yield* ApiUser.ensureFromWorkosUser({
			input: { workosUser: session.user },
		}).safeUnwrap();
		return ok({
			wosSessionString: await createWosSessionString(session),
		});
	})),
	error: ({ error }) =>
		new ProcedureError("Couldn't verify one-time password", error),
});
