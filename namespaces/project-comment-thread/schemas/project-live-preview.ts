import type { QueryCtx } from '@-/database';
import { idSchema } from '@-/database/schemas';

interface ProjectLivePreviewIdSchemaOptions {
	actorRelation: 'host' | 'hasPermission' | 'anyone';
}

/**
	@example ```
		WebappApiInput.projectLivePreview(options)(input, ctx)
	```
*/
export function getProjectLivePreviewIdSchema(
	_ctx: QueryCtx,
	_options: ProjectLivePreviewIdSchemaOptions,
) {
	return idSchema('ProjectLivePreview').refine(async () => {
		return true;
	});
}
