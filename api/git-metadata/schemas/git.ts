import { z } from '@-/zod';

export const projectGitMetadataSchema = z.object({
	gitUrl: z.string().nullable(),
	branch: z
		.object({
			name: z.string(),
		})
		.nullable(),
	latestCommit: z
		.object({
			sha: z.string(),
			message: z.string(),
		})
		.nullable(),
});

export const projectCommentThreadGitMetadataSchema = z.object({
	gitUrl: z.string().nullable(),
	branchName: z.string().nullable(),
	commitSha: z.string().nullable(),
});
