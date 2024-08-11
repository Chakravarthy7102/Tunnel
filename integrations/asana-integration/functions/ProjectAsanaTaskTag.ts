import { v } from '@-/convex/values';
import {
	applyInclude,
	dbInsert,
	protectedMutation,
	protectedQuery,
} from '@-/database/function-utils';
import { vInclude } from '@-/database/validators';
import { UnexpectedError } from '@-/errors';

export const ProjectAsanaTaskTag_create = protectedMutation(
	'ProjectAsanaTaskTag',
	{
		args: {
			input: v.object({
				data: v.object({
					projectAsanaTask: v.id('ProjectAsanaTask'),
					name: v.string(),
				}),
			}),
		},
		async handler(ctx, { input: { data } }) {
			const projectAsanaTask = await ctx.db.get(data.projectAsanaTask);
			if (projectAsanaTask === null) {
				throw new Error('ProjectLinearIssue not found');
			}

			const existingAsanaTask = await ctx.db
				.query('ProjectAsanaTaskTag')
				.withIndex('by_name', (q) => q.eq('name', data.name))
				.first();

			if (existingAsanaTask !== null) {
				return existingAsanaTask._id;
			}

			const _id = await dbInsert(
				ctx,
				'ProjectAsanaTaskTag',
				{ ...data, organization: projectAsanaTask.organization },
				{
					unique: {
						by_name: ['name'],
					},
				},
			);
			return _id;
		},
		error: (error) =>
			new UnexpectedError('while creating the asana task tag', {
				cause: error,
			}),
	},
);

export const ProjectAsanaTaskTag_list = protectedQuery(
	'ProjectAsanaTaskTag',
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
				'ProjectAsanaTaskTag',
				await ctx.db
					.query('ProjectAsanaTaskTag')
					.withIndex(
						'by_organization',
						(q) => q.eq('organization', where.organization),
					)
					.collect(),
				include,
			);
		},
		error: (error) =>
			new UnexpectedError('while listing asana task tags', { cause: error }),
	},
);
