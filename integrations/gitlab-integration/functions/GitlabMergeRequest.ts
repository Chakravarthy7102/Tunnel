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

export const GitlabMergeRequest_create = protectedMutation(
	'GitlabMergeRequest',
	{
		args: {
			input: v.object({
				data: v.object({
					authorOrganizationMember: v.id('OrganizationMember'),
					mergeRequestId: v.number(),
					mergeRequestIid: v.number(),
					projectId: v.number(),
					noteId: v.number(),
					sourceBranch: v.string(),
					isOpen: v.boolean(),
					latestCommitSha: v.string(),
				}),
				include: vInclude(),
			}),
		},
		async handler(ctx, { input: { data, include } }) {
			const id = await dbInsert(
				ctx,
				'GitlabMergeRequest',
				data,
				{ unique: {} },
			);

			return applyInclude(
				ctx,
				'GitlabMergeRequest',
				id,
				include,
			);
		},
		error: (error) =>
			new UnexpectedError(
				'while creating the GitLab merge request',
				{ cause: error },
			),
	},
);

export const GitlabMergeRequest_update = protectedMutation(
	'GitlabMergeRequest',
	{
		args: {
			input: v.object({
				id: v.id('GitlabMergeRequest'),
				updates: v.object({
					isOpen: v.optional(v.boolean()),
					latestCommitSha: v.optional(v.string()),
				}),
			}),
		},
		async handler(ctx, { input: { id, updates } }) {
			await dbPatch(ctx, 'GitlabMergeRequest', id, updates, { unique: {} });
		},
		error: (error) =>
			new UnexpectedError('while updating the GitLab merge request', {
				cause: error,
			}),
	},
);

export const GitlabMergeRequest_get = protectedQuery('GitlabMergeRequest', {
	args: {
		from: v.union(
			v.object({ id: v.id('GitlabMergeRequest') }),
			v.object({ mergeRequestId: v.number() }),
		),
		include: vInclude(),
	},
	async handler(ctx, { from, include }) {
		switch (true) {
			case 'id' in from: {
				return applyInclude(ctx, 'GitlabMergeRequest', from.id, include);
			}

			case 'mergeRequestId' in from: {
				return applyInclude(
					ctx,
					'GitlabMergeRequest',
					await ctx.db
						.query('GitlabMergeRequest')
						.withIndex(
							'by_mergeRequestId',
							(q) => q.eq('mergeRequestId', from.mergeRequestId),
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
