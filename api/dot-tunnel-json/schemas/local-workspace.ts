import { idSchema } from '@-/database/schemas';
import { z } from '@-/zod';

export const localWorkspaceSchema = z.object({
	relativeDirpath: z.string(),
	userLocalWorkspaceId: idSchema('UserLocalWorkspace'),
	userId: idSchema('User'),
	projectId: idSchema('Project'),
	linkedTunnelInstanceProxyPreviewId: idSchema('TunnelInstanceProxyPreview')
		.nullable(),
});
