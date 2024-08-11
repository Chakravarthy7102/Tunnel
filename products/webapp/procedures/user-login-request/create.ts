import { defineProcedure } from '#utils/procedure.ts';
import { env } from '@-/env';
import { ProcedureError } from '@-/errors';
import { z } from '@-/zod';
import Ably from 'ably/promises.js';
import { $try, ok, ResultAsync } from 'errok';

export const userLoginRequest_create = defineProcedure({
	input: z.object({
		loginRequestId: z.string(),
	}),
	mutation: async ({ input }) => ($try(async function*() {
		const ably = new Ably.Rest({ key: env('ABLY_API_KEY') });
		const tokenDetails = yield* ResultAsync.fromPromise(
			ably.auth.requestToken({ clientId: input.loginRequestId }),
			() => new Error("Couldn't create token request"),
		).safeUnwrap();
		return ok({ tokenDetails });
	})),
	error: ({ error }) => new ProcedureError("Couldn't initiate login", error),
});
