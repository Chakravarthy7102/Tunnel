import type { ArgsWithToken, QueryCtx } from '@-/database';
import { getActorUser } from '@-/database/function-utils';
import { getIdSchema } from '@-/database/schemas';

interface UserIdSchemaOptions {
	actorRelation: 'actor' | 'notActor';
}

export function getUserIdSchema(
	ctx: QueryCtx,
	args: ArgsWithToken,
	options: UserIdSchemaOptions,
) {
	return getIdSchema(ctx, 'User').refine(async (id) => {
		const user = await ctx.db.get(id);
		if (user === null) throw new Error('User not found');
		const actorUser = await getActorUser(ctx, args);

		if (
			options.actorRelation === 'notActor' &&
			actorUser._id === user._id
		) {
			throw new Error('User cannot be the actor');
		} else if (
			options.actorRelation === 'actor' &&
			actorUser._id !== user._id
		) {
			throw new Error('User must be the actor');
		}

		return true;
	});
}
