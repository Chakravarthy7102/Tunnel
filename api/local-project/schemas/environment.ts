import { idSchema } from '@-/database/schemas';
import { projectGitMetadataSchema } from '@-/git-metadata/schemas';
import { z } from '@-/zod';

export const localProjectEnvironmentSchema = z.object({
	name: z.string(),
	gitMetadata: projectGitMetadataSchema.nullable(),
	providedProjectId: idSchema('Project'),
	rootDirpath: z.string(),
	workingDirpath: z.string(),
	localTunnelProxyServerPortNumber: z.number(),
	localServicePortNumber: z.number(),
	tunnelCliSourceDirpath: z.string(),
});
