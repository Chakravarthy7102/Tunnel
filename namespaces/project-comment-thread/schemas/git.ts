import { z } from '@-/zod';

export const gitMetadataPropertyValidators = {
	gitUrl: z.string().nullable(),
	commitSha: z.string().nullable(),
	branchName: z.string().nullable(),
};
