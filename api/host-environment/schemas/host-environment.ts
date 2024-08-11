import { HostEnvironmentType } from '#enums/host-environment-type.ts';
import { projectGitMetadataSchema } from '@-/git-metadata/schemas';
import { localProjectEnvironmentSchema } from '@-/local-project/schemas';
import { withErrorsSchema } from '@-/with-errors/schemas';
import { z } from '@-/zod';

export const scriptTagLivePreviewHostEnvironmentSchema = z.object({
	type: z.literal(HostEnvironmentType.scriptTag),
	projectId: z.union([z.string(), z.undefined()]),
	gitMetadata: withErrorsSchema(projectGitMetadataSchema.nullable()),
});

export const wrapperCommandLivePreviewHostEnvironmentSchema = z.object({
	type: z.literal(HostEnvironmentType.wrapperCommand),
	localProjectEnvironment: localProjectEnvironmentSchema,
});

export const tunnelShareLivePreviewHostEnvironmentSchema = z.object({
	type: z.literal(HostEnvironmentType.tunnelShare),
	localProjectEnvironment: localProjectEnvironmentSchema,
});

export const hostEnvironmentTypeSchema = z.enum([
	HostEnvironmentType.wrapperCommand,
	HostEnvironmentType.tunnelShare,
	HostEnvironmentType.scriptTag,
	HostEnvironmentType.dashboard,
]);
