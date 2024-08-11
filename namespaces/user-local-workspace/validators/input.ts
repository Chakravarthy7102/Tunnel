import { v } from '@-/convex/values';
import type { ArgsWithToken, QueryCtx } from '@-/database';
import { getActorUser } from '@-/database/function-utils';
import { getIdSchema } from '@-/database/schemas';
import { vId } from '@-/database/validators';

export const userLocalWorkspaceInputValidator = v.union(
	vId('UserLocalWorkspace'),
	v.object({
		user: vId('User'),
		project: vId('Project'),
		relativeDirpath: v.string(),
	}),
);

interface UserLocalWorkspaceInputSchemaOptions {
	actorRelation: 'actor';
}

export function getUserLocalWorkspaceInputSchema(
	ctx: QueryCtx,
	args: ArgsWithToken,
	_options: UserLocalWorkspaceInputSchemaOptions,
) {
	return getIdSchema(ctx, 'UserLocalWorkspace').refine(async (id) => {
		const userLocalWorkspace = await ctx.db.get(id);
		if (userLocalWorkspace === null) {
			throw new Error('User local workspace not found');
		}

		const actorUser = await getActorUser(ctx, args);
		if (actorUser._id !== userLocalWorkspace.user) {
			throw new Error('Actor is not the user of the user local workspace');
		}

		return true;
	});
}
