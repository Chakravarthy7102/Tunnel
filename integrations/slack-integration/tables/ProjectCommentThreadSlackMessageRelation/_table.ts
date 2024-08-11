import { v } from '@-/convex/values';
import { table, vDeprecated } from 'corvex';

/**
	We use a join table instead of a nested table to support assigning multiple linear issues to a comment thread.
*/
export const ProjectCommentThreadSlackMessageRelation = table(
	'ProjectCommentThreadSlackMessageRelation',
	v.object({
		type: v.literal('created'),
		projectCommentThread: v.id('ProjectCommentThread'),
		projectSlackMessage: v.id('ProjectSlackMessage'),
		cid: vDeprecated<string>('Use `_id` instead'),
	}),
	(t) =>
		t
			.index('by_cid', ['cid'])
			.index('by_projectCommentThread', ['projectCommentThread'])
			.index('by_projectSlackMessage', ['projectSlackMessage']),
)({
	projectCommentThread: {
		foreignTable: 'ProjectCommentThread',
		hostIndex: 'by_projectCommentThread',
		onDelete: 'Cascade',
	},
	projectSlackMessage: {
		foreignTable: 'ProjectSlackMessage',
		hostIndex: 'by_projectSlackMessage',
		onDelete: 'Cascade',
	},
});
