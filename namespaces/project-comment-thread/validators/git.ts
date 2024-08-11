import { v } from '@-/convex/values';
import { vNullable } from 'corvex';

export const gitMetadataPropertyValidators = {
	gitUrl: vNullable(v.string()),
	commitSha: vNullable(v.string()),
	branchName: vNullable(v.string()),
};
