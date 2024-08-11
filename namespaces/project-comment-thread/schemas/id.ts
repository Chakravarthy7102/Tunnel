import type { QueryCtx } from '@-/database';
import { getIdSchema } from '@-/database/schemas';

interface ProjectCommentThreadIdSchemaOptions {
}

export function getProjectCommentThreadIdSchema(
	ctx: QueryCtx,
	_options: ProjectCommentThreadIdSchemaOptions,
) {
	return getIdSchema(ctx, 'ProjectCommentThread').refine(async (id) => {
		const projectCommentThread = await ctx.db.get(id);
		if (projectCommentThread === null) {
			throw new Error('Project comment thread not found');
		}

		// TODO: Check actor permission

		return true;
	});
}
