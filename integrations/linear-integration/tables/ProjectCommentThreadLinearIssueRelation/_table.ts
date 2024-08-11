import { v } from '@-/convex/values';
import { table, vDeprecated } from 'corvex';

/**
	We use a join table instead of a nested table to support assigning multiple linear issues to a comment thread.
*/
export const ProjectCommentThreadLinearIssueRelation = table(
	'ProjectCommentThreadLinearIssueRelation',
	v.object({
		type: v.literal('created'),
		projectCommentThread: v.id('ProjectCommentThread'),
		projectLinearIssue: v.id('ProjectLinearIssue'),
		cid: vDeprecated<string>('Use `_id` instead'),
	}),
	(t) =>
		t
			.index('by_cid', ['cid'])
			.index('by_projectCommentThread', ['projectCommentThread'])
			.index('by_projectLinearIssue', ['projectLinearIssue'])
			.index('by_projectCommentThread_projectLinearIssue', [
				'projectCommentThread',
				'projectLinearIssue',
			]),
)({
	projectCommentThread: {
		foreignTable: 'ProjectCommentThread',
		hostIndex: 'by_projectCommentThread',
		onDelete: 'Cascade',
	},
	projectLinearIssue: {
		foreignTable: 'ProjectLinearIssue',
		hostIndex: 'by_projectLinearIssue',
		onDelete: 'Cascade',
	},
});
