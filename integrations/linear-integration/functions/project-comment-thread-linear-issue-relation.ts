import { v } from '@-/convex/values';
import {
	applyInclude,
	dbInsert,
	protectedMutation,
} from '@-/database/function-utils';
import { vInclude } from '@-/database/validators';
import { UnexpectedError } from '@-/errors';

export const ProjectCommentThreadLinearIssueRelation_create = protectedMutation(
	'ProjectCommentThreadLinearIssueRelation',
	{
		args: {
			input: v.object({
				data: v.object({
					projectCommentThread: v.id('ProjectCommentThread'),
					projectLinearIssue: v.id('ProjectLinearIssue'),
				}),
				include: vInclude(),
			}),
		},
		async handler(ctx, { input: { data, include } }) {
			const id = await dbInsert(
				ctx,
				'ProjectCommentThreadLinearIssueRelation',
				{ ...data, type: 'created' },
				{ unique: {} },
			);

			return applyInclude(
				ctx,
				'ProjectCommentThreadLinearIssueRelation',
				id,
				include,
			);
		},
		error: (error) =>
			new UnexpectedError(
				'while associating the project comment thread with the linear issue',
				{ cause: error },
			),
	},
);
