import { v } from '@-/convex/values';
import {
	applyInclude,
	dbInsert,
	protectedMutation,
	protectedQuery,
} from '@-/database/function-utils';
import { vInclude } from '@-/database/validators';
import { UnexpectedError } from '@-/errors';

export const ProjectJiraIssueLabel_create = protectedMutation(
	'ProjectJiraIssueLabel',
	{
		args: {
			input: v.object({
				data: v.object({
					projectJiraIssue: v.id('ProjectJiraIssue'),
					name: v.string(),
				}),
			}),
		},
		async handler(ctx, { input: { data } }) {
			const projectJiraIssue = await ctx.db.get(data.projectJiraIssue);
			if (projectJiraIssue === null) {
				throw new Error('ProjectLinearIssue not found');
			}

			const existingJiraLabel = await ctx.db
				.query('ProjectJiraIssueLabel')
				.withIndex('by_name', (q) => q.eq('name', data.name))
				.first();

			if (existingJiraLabel !== null) {
				return existingJiraLabel._id;
			}

			const _id = await dbInsert(
				ctx,
				'ProjectJiraIssueLabel',
				{ ...data, organization: projectJiraIssue.organization },
				{
					unique: {
						by_name: ['name'],
					},
				},
			);
			return _id;
		},
		error: (error) =>
			new UnexpectedError('while creating the jira issue label', {
				cause: error,
			}),
	},
);

export const ProjectJiraIssueLabel_list = protectedQuery(
	'ProjectJiraIssueLabel',
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
				'ProjectJiraIssueLabel',
				await ctx.db
					.query('ProjectJiraIssueLabel')
					.withIndex(
						'by_organization',
						(q) => q.eq('organization', where.organization),
					)
					.collect(),
				include,
			);
		},
		error: (error) =>
			new UnexpectedError('while listing jira issue labels', { cause: error }),
	},
);
