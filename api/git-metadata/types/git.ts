import type {
	projectCommentThreadGitMetadataSchema,
	projectGitMetadataSchema,
} from '#schemas/git.ts';
import type { z } from '@-/zod';

export type ProjectCommentThreadGitMetadata = z.infer<
	typeof projectCommentThreadGitMetadataSchema
>;
export type ProjectGitMetadata = z.infer<typeof projectGitMetadataSchema>;
