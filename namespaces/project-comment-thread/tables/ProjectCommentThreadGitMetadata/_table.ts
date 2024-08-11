import { gitMetadataPropertyValidators } from '#validators/git.ts';
import { v } from '@-/convex/values';
import { table, vDeprecated } from 'corvex';

export const ProjectCommentThreadGitMetadata = table(
	'ProjectCommentThreadGitMetadata',
	v.object({
		projectCommentThread: v.id('ProjectCommentThread'),
		...gitMetadataPropertyValidators,
		cid: vDeprecated<string>('Use `_id` instead'),
	}),
	(t) =>
		t
			.index('by_cid', ['cid'])
			.index('by_projectCommentThread', ['projectCommentThread'])
			.index('by_gitUrl', ['gitUrl'])
			.index('by_commitSha', ['commitSha'])
			.index('by_branchName', ['branchName']),
)({
	projectCommentThread: {
		foreignTable: 'ProjectCommentThread',
		hostIndex: 'by_projectCommentThread',
		onDelete: 'Cascade',
	},
});
