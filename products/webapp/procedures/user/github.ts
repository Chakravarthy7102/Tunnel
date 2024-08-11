import { WebappApiInput } from '#api-input';
import { defineProcedure } from '#utils/procedure.ts';
import { env } from '@-/env';
import { ProcedureError } from '@-/errors';
import { z } from '@-/zod';
import { $try, ok } from 'errok';
import jsonwebtoken from 'jsonwebtoken';

export const user_getGithubOauthAuthorizeUrl = defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.object({
			user: WebappApiInput.user({
				actor,
				actorRelation: 'actor',
			})(input, ctx),
		})),
	query: async ({ input }) => ($try(async function*() {
		const userId = yield* input.user.safeUnwrap();
		return ok(
			`https://github.com/login/oauth/authorize?scope=user:email&client_id=${
				env('NEXT_PUBLIC_GH_OAUTH_APP_CLIENT_ID')
			}&state=${
				jsonwebtoken.sign(
					{ userId },
					env('JWT_SECRET_KEY'),
				)
			}`,
		);
	})),
	error: ({ error }) => new ProcedureError("Couldn't get user", error),
});
