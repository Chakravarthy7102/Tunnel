import type { QueryCtx } from '@-/database';
import { getIdSchema } from '@-/database/schemas';

interface ProjectCommentInputSchemaOptions {
}

export function getProjectCommentInputSchema(
	ctx: QueryCtx,
	_options: ProjectCommentInputSchemaOptions,
) {
	return getIdSchema(ctx, 'ProjectComment').refine(async (id) => {
		const projectComment = await ctx.db.get(id);
		if (projectComment === null) {
			throw new Error('Project comment not found');
		}

		// TODO: Check actor permission

		return true;
	});
}
