import { v } from '@-/convex/values';
import {
	applyInclude,
	dbInsert,
	protectedMutation,
} from '@-/database/function-utils';
import { vInclude } from '@-/database/validators';
import { UnexpectedError } from '@-/errors';

export const ProjectCommentThreadJiraIssueRelation_create = protectedMutation(
	'ProjectCommentThreadJiraIssueRelation',
	{
		args: {
			input: v.object({
				data: v.object({
					projectCommentThread: v.id('ProjectCommentThread'),
					projectJiraIssue: v.id('ProjectJiraIssue'),
				}),
				include: vInclude(),
			}),
		},
		async handler(ctx, { input: { data, include } }) {
			const id = await dbInsert(
				ctx,
				'ProjectCommentThreadJiraIssueRelation',
				{ ...data, type: 'created' },
				{ unique: {} },
			);

			return applyInclude(
				ctx,
				'ProjectCommentThreadJiraIssueRelation',
				id,
				include,
			);
		},
		error: (error) =>
			new UnexpectedError(
				'while associating the project comment thread with the jira issue',
				{ cause: error },
			),
	},
);
