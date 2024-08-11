import { v } from '@-/convex/values';
import {
	applyInclude,
	dbInsert,
	protectedMutation,
	protectedQuery,
} from '@-/database/function-utils';
import { vInclude } from '@-/database/validators';
import { UnexpectedError } from '@-/errors';

export const ProjectLinearIssueLabel_create = protectedMutation(
	'ProjectLinearIssueLabel',
	{
		args: {
			input: v.object({
				data: v.object({
					projectLinearIssue: v.id('ProjectLinearIssue'),
					labelId: v.string(),
					name: v.string(),
				}),
			}),
		},
		async handler(ctx, { input: { data } }) {
			const projectLinearIssue = await ctx.db.get(data.projectLinearIssue);
			if (projectLinearIssue === null) {
				throw new Error('ProjectLinearIssue not found');
			}

			const existingLinearLabel = await ctx.db
				.query('ProjectLinearIssueLabel')
				.withIndex('by_labelId', (q) => q.eq('labelId', data.labelId))
				.first();

			if (existingLinearLabel !== null) {
				return existingLinearLabel._id;
			}

			const _id = await dbInsert(
				ctx,
				'ProjectLinearIssueLabel',
				{ ...data, organization: projectLinearIssue.organization },
				{
					unique: {
						by_labelId: ['labelId'],
					},
				},
			);
			return _id;
		},
		error: (error) =>
			new UnexpectedError('while creating the project linear issue label', {
				cause: error,
			}),
	},
);

export const ProjectLinearIssueLabel_list = protectedQuery(
	'ProjectLinearIssueLabel',
	{
		args: {
			where: v.object({
				organization: v.id('Organization'),
			}),
			include: vInclude(),
		},
		async handler(ctx, { include, where }) {
			return applyInclude(
				ctx,
				'ProjectLinearIssueLabel',
				await ctx.db
					.query('ProjectLinearIssueLabel')
					.withIndex(
						'by_organization',
						(q) => q.eq('organization', where.organization),
					)
					.collect(),
				include,
			);
		},
		error: (error) =>
			new UnexpectedError('while listing project linear issue labels', {
				cause: error,
			}),
	},
);
