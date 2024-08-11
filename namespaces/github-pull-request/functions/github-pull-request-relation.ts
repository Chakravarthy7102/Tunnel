import { v } from '@-/convex/values';
import {
	applyInclude,
	dbInsert,
	protectedMutation,
} from '@-/database/function-utils';
import { vInclude } from '@-/database/validators';
import { UnexpectedError } from '@-/errors';

export const GithubPullRequestRelation_create = protectedMutation(
	'GithubPullRequestRelation',
	{
		args: {
			input: v.object({
				data: v.object({
					project: v.id('Project'),
					githubPullRequest: v.id('GithubPullRequest'),
				}),
				include: vInclude(),
			}),
		},
		async handler(ctx, { input: { data, include } }) {
			const id = await dbInsert(
				ctx,
				'GithubPullRequestRelation',
				{ ...data },
				{ unique: {} },
			);
			return applyInclude(ctx, 'GithubPullRequestRelation', id, include);
		},
		error: (error) =>
			new UnexpectedError('while creating the GitHub pull request relation', {
				cause: error,
			}),
	},
);
