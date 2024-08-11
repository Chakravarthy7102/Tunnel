import { v } from '@-/convex/values';
import { table, vDeprecated } from 'corvex';

/**
	We use a join table instead of a nested table because linear issues should exist independently of project comment threads so that there is a single source of truth. For example, if an assignee is updated in the source of a linear issue, we should only need to update that in one place.

	In addition, this allows a jira issue to be referenced by multiple project comment threads, which is useful for broader issues such as "fix marketing site typos."
*/
export const ProjectCommentThreadJiraIssueRelation = table(
	'ProjectCommentThreadJiraIssueRelation',
	v.object({
		/**
		The type of the relation between the project comment thread and the jira issue.	For example, if the type is "created", then the jira issue should reflect the state of the project comment thread (if you update the comment thread's, it should update the jira issue's description). If the type is "linked", any updates to the project comment thread shouldn't update the source jira issue.
	 */
		type: v.literal('created'),
		projectCommentThread: v.id('ProjectCommentThread'),
		projectJiraIssue: v.id('ProjectJiraIssue'),
		cid: vDeprecated<string>('Use `_id` instead'),
	}),
	(t) =>
		t
			.index('by_cid', ['cid'])
			.index('by_projectCommentThread', ['projectCommentThread'])
			.index('by_projectJiraIssue', ['projectJiraIssue']),
)({
	projectCommentThread: {
		foreignTable: 'ProjectCommentThread',
		hostIndex: 'by_projectCommentThread',
		onDelete: 'Cascade',
	},
	projectJiraIssue: {
		foreignTable: 'ProjectJiraIssue',
		hostIndex: 'by_projectJiraIssue',
		onDelete: 'Cascade',
	},
});
