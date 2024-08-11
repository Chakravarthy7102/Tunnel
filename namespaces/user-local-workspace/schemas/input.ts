import type { ArgsWithToken, QueryCtx } from '@-/database';
import { getActorUser } from '@-/database/function-utils';
import { getIdSchema } from '@-/database/schemas';
import { z } from '@-/zod';

interface UserLocalWorkspaceIdSchemaOptions {
	actorRelation: 'actor';
}

export function getUserLocalWorkspaceIdSchema(
	ctx: QueryCtx,
	args: ArgsWithToken,
	options: UserLocalWorkspaceIdSchemaOptions,
) {
	return getIdSchema(ctx, 'UserLocalWorkspace').refine(async (id) => {
		const userLocalWorkspace = await ctx.db.get(id);

		if (userLocalWorkspace === null) {
			throw new Error('User local workspace not found');
		}

		const actorUser = await getActorUser(ctx, args);
		if (
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- Todo
			options.actorRelation === 'actor' &&
			actorUser._id !== userLocalWorkspace.user
		) {
			throw new Error('User must be the actor');
		}

		return true;
	});
}

interface UserLocalWorkspaceInputSchemaOptions {
	actorRelation: 'actor';
}

export function getUserLocalWorkspaceInputSchema(
	ctx: QueryCtx,
	args: ArgsWithToken,
	options: UserLocalWorkspaceInputSchemaOptions,
) {
	return z.union([
		getIdSchema(ctx, 'UserLocalWorkspace'),
		z.object({
			user: getIdSchema(ctx, 'User'),
			project: getIdSchema(ctx, 'Project'),
			relativeDirpath: z.string(),
		}),
	]).transform(async (input) => {
		if (typeof input === 'string') {
			return input;
		}

		const userLocalWorkspace = await ctx.db.query('UserLocalWorkspace')
			.withIndex(
				'by_project_relativeDirpath_user',
				(q) => (q
					.eq('project', input.project)
					.eq('relativeDirpath', input.relativeDirpath)
					.eq('user', input.user)),
			).first();

		if (userLocalWorkspace === null) {
			throw new Error('User local workspace not found');
		}

		return userLocalWorkspace._id;
	}).pipe(getUserLocalWorkspaceIdSchema(ctx, args, options));
}
