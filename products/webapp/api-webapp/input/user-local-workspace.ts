import type { ActorMetaschema, Context } from '#types';
import { ApiConvex } from '@-/convex/api';
import {} from '@-/database';
import { idSchema } from '@-/database/schemas';
import { DocumentNotFoundError } from '@-/errors';
import { z } from '@-/zod';
import { $try, err, ok } from 'errok';
import { getActorRefDataFromActorMetaschema } from './internal/actor.ts';

interface UserLocalWorkspaceRefinerOptions {
	actor: ActorMetaschema;
	actorRelation: 'actor';
}

/**
	@example ```
		WebappApiInput.userLocalWorkspace(options)(input, ctx)
	```
*/
export function WebappApiInput_userLocalWorkspace(
	options: UserLocalWorkspaceRefinerOptions,
) {
	return function(_input: unknown, ctx: Context) {
		return z
			.object({ id: idSchema('UserLocalWorkspace') })
			.transform(async ({ id }) => ($try(async function*() {
				if (ctx.accessToken === null) {
					return err(new Error('Session token required'));
				}

				const userLocalWorkspace = yield* ApiConvex.v.UserLocalWorkspace
					.get_userData({
						input: { from: id },
					}, {
						token: ctx.accessToken,
					}).safeUnwrap();

				if (userLocalWorkspace === null) {
					return err(new DocumentNotFoundError('UserLocalWorkspace'));
				}

				const actorRefData = yield* getActorRefDataFromActorMetaschema({
					actorMetaschema: options.actor,
					ctx,
				}).safeUnwrap();

				if (actorRefData === null || actorRefData.type !== 'User') {
					return err(new Error('Actor must be authorized as a user'));
				}

				if (userLocalWorkspace.user._id !== actorRefData.id) {
					return err(
						new Error('Actor must be the owner of the local workspace'),
					);
				}

				return ok(userLocalWorkspace._id);
			})));
	};
}
