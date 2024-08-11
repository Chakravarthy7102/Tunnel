import { v } from '@-/convex/values';
import {
	applyInclude,
	dbInsert,
	protectedMutation,
} from '@-/database/function-utils';
import { vInclude } from '@-/database/validators';
import { UnexpectedError } from '@-/errors';

export const GitlabMergeRequestRelation_create = protectedMutation(
	'GitlabMergeRequestRelation',
	{
		args: {
			input: v.object({
				data: v.object({
					project: v.id('Project'),
					gitlabMergeRequest: v.id('GitlabMergeRequest'),
				}),
				include: vInclude(),
			}),
		},
		async handler(ctx, { input: { data, include } }) {
			const id = await dbInsert(
				ctx,
				'GitlabMergeRequestRelation',
				{ ...data },
				{ unique: {} },
			);
			return applyInclude(ctx, 'GitlabMergeRequestRelation', id, include);
		},
		error: (error) =>
			new UnexpectedError('while creating the GitLab merge request relation', {
				cause: error,
			}),
	},
);
