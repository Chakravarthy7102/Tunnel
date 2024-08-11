import { idSchema } from '@-/database/schemas';
import { z } from '@-/zod';
import { localWorkspaceSchema } from './local-workspace.ts';

export const dotTunnelJsonSchema = z.object({
	localWorkspaces: z.array(localWorkspaceSchema),
	// Map from local workspace IDs
	activeLocalWorkspaces: z.record(
		// `${userId}|${relativeDirpath}`
		z.string(),
		// userLocalWorkspaceId
		idSchema('UserLocalWorkspace').nullable(),
	),
});
