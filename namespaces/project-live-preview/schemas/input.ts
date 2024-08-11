import type { ArgsWithToken, QueryCtx } from '@-/database';
import { getIdSchema } from '@-/database/schemas';

interface ProjectLivePreviewIdSchemaOptions {
	actorRelation: 'host' | 'hasPermission' | 'anyone';
}

/**
	@example ```
		WebappApiInput.projectLivePreview(options)(input, ctx)
	```
*/
export function getProjectLivePreviewIdSchema(
	ctx: QueryCtx,
	_args: ArgsWithToken,
	_options: ProjectLivePreviewIdSchemaOptions,
) {
	return getIdSchema(ctx, 'ProjectLivePreview').refine(async (id) => {
		const projectLivePreview = await ctx.db.get(id);
		if (projectLivePreview === null) {
			throw new Error('Project live preview not found');
		}

		// TODO: Check actor permission

		return true;
	});
}
