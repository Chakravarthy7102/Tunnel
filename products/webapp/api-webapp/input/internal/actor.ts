import type { ActorMetaschema, Context } from '#types';
import { getWorkos } from '@-/auth/workos';
import type { Id } from '@-/database';
import { InvalidAuthError, MissingAuthError } from '@-/errors';
import { ApiUser } from '@-/user/api';
import { z } from '@-/zod';
import { $try, err, ok, type Result, ResultAsync } from 'errok';
import type { JWTVerifyResult } from 'jose';
import { jwtDecode } from 'jwt-decode';

export function getActorRefDataFromActorMetaschema({
	actorMetaschema,
	ctx,
}: {
	actorMetaschema: ActorMetaschema;
	ctx: Context;
}) {
	return ResultAsync.fromFunction(async () => {
		const { actorProperty, input } = actorMetaschema;
		const data = await z
			.object({
				[actorProperty]: z.union(
					// @ts-expect-error: guaranteed to have at least one element
					Object.values(actorInputSchemas).map((actorInputSchema) =>
						actorInputSchema(input, ctx)
					),
				),
			})
			.parseAsync(input);

		return data[actorProperty] as Result<
			{ type: string; id: Id<'User'> } | null,
			Error
		>;
	});
}

/**
	These actor input schemas determine if a client is authorized to identify as a certain type of actor.

	These actor schemas differs from `WebappApiInput` schemas which determine if the actor (who has already been authorized to be the actor they claim to be) is allowed to interact with a specific resource.

	For example, `actorInputSchemas.user` determine if the actor is allowed to identify as a certain user and access certain routes only avaliable to users. `WebappApiInput.user(...)` determines if the actor is allowed to access/modify a specific user resource.
*/
export const actorInputSchemas = {
	User(_input: unknown, ctx: Context) {
		return z
			.object({
				type: z.literal('User'),
				data: z.object({
					id: z.string(),
				}),
			})
			.transform(async (actor) => ($try(async function*() {
				if (ctx.accessToken === null) {
					// We throw an error here so that it's caught by the global tRPC error handler
					throw new MissingAuthError();
				}

				let payload: JWTVerifyResult['payload'];
				try {
					// We use JWT decode here because we already verify the token in the middleware
					payload = await jwtDecode(ctx.accessToken);
				} catch {
					// We throw an error here so that it's caught by the global tRPC error handler
					throw new InvalidAuthError();
				}

				if (payload.sub === undefined) {
					throw new InvalidAuthError();
				}

				const workos = getWorkos();
				const workosUser = await workos.userManagement.getUser(payload.sub);
				const userId = yield* ApiUser.ensureFromWorkosUser({
					input: { workosUser },
				}).safeUnwrap();

				if (actor.data.id !== userId) {
					return err(new Error('Must authenticate as correct user'));
				}

				return ok({
					type: 'User',
					id: userId,
				});
			})));
	},
};
