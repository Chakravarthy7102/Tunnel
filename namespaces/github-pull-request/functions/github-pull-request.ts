import { v } from '@-/convex/values';
import {
	applyInclude,
	dbInsert,
	dbPatch,
	protectedMutation,
	protectedQuery,
} from '@-/database/function-utils';
import { vInclude } from '@-/database/validators';
import { UnexpectedError } from '@-/errors';
import { unreachableCase } from '@tunnel/ts';

export const GithubPullRequest_create = protectedMutation('GithubPullRequest', {
	args: {
		input: v.object({
			data: v.object({
				branch: v.string(),
				pullRequestId: v.number(),
				isOpen: v.boolean(),
				issueNumber: v.number(),
				commentId: v.number(),
				ownerLogin: v.string(),
				repoName: v.string(),
				repoId: v.number(),
				senderId: v.number(),
				checkRunId: v.number(),
			}),
			include: vInclude(),
		}),
	},
	async handler(ctx, { input: { data, include } }) {
		const id = await dbInsert(ctx, 'GithubPullRequest', data, { unique: {} });
		return applyInclude(ctx, 'GithubPullRequest', id, include);
	},
	error: (error) =>
		new UnexpectedError('while creating the GitHub pull request', {
			cause: error,
		}),
});

export const GithubPullRequest_get = protectedQuery('GithubPullRequest', {
	args: {
		from: v.union(
			v.object({ id: v.id('GithubPullRequest') }),
			v.object({ pullRequestId: v.number() }),
		),
		include: vInclude(),
	},
	async handler(ctx, { from, include }) {
		switch (true) {
			case 'id' in from: {
				return applyInclude(ctx, 'GithubPullRequest', from.id, include);
			}

			case 'pullRequestId' in from: {
				return applyInclude(
					ctx,
					'GithubPullRequest',
					await ctx.db
						.query('GithubPullRequest')
						.withIndex(
							'by_pullRequestId',
							(q) => q.eq('pullRequestId', from.pullRequestId),
						)
						.first(),
					include,
				);
			}

			default: {
				return unreachableCase(from, `Invalid from: ${JSON.stringify(from)}`);
			}
		}
	},
	error: (error) =>
		new UnexpectedError('while retrieving the GitHub pull request', {
			cause: error,
		}),
});

export const GithubPullRequest_update = protectedMutation('GithubPullRequest', {
	args: {
		input: v.object({
			id: v.id('GithubPullRequest'),
			updates: v.object({
				isOpen: v.boolean(),
			}),
		}),
	},
	async handler(ctx, { input: { id, updates } }) {
		await dbPatch(ctx, 'GithubPullRequest', id, updates, { unique: {} });
	},
	error: (error) =>
		new UnexpectedError('while updating the GitHub pull request', {
			cause: error,
		}),
});
