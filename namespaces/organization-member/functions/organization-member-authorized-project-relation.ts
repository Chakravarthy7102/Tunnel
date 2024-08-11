import { v } from '@-/convex/values';
import {
	applyInclude,
	dbDelete,
	dbInsert,
	defineGetHandler,
	defineListHandler,
	protectedGetQuery,
	protectedListQuery,
	protectedMutation,
} from '@-/database/function-utils';
import { vInclude } from '@-/database/validators';
import { UnexpectedError } from '@-/errors';
import { unreachableCase } from '@tunnel/ts';

export const OrganizationMemberAuthorizedProjectRelation_create =
	protectedMutation(
		'OrganizationMemberAuthorizedProjectRelation',
		{
			args: {
				input: v.object({
					data: v.object({
						organizationMember: v.id('OrganizationMember'),
						project: v.id('Project'),
					}),
					include: vInclude(),
				}),
			},
			async handler(ctx, { input: { data, include } }) {
				const id = await dbInsert(
					ctx,
					'OrganizationMemberAuthorizedProjectRelation',
					data,
					{
						unique: {
							by_organizationMember_project: [
								'organizationMember',
								'project',
							],
						},
					},
				);
				return applyInclude(
					ctx,
					'OrganizationMemberAuthorizedProjectRelation',
					id,
					include,
				);
			},
			error: (error) =>
				new UnexpectedError('while adding member to project', {
					cause: error,
				}),
		},
	);

const getHandler = defineGetHandler(
	'OrganizationMemberAuthorizedProjectRelation',
	{
		from: v.union(
			v.object({ id: v.id('OrganizationMemberAuthorizedProjectRelation') }),
			v.object({
				organizationMember: v.id('OrganizationMember'),
				project: v.id('Project'),
			}),
		),
	},
	async (ctx, { from }) => {
		switch (true) {
			case 'id' in from: {
				return from.id;
			}

			case 'organizationMember' in from && 'project' in from: {
				return ctx.db
					.query('OrganizationMemberAuthorizedProjectRelation')
					.withIndex(
						'by_organizationMember_project',
						(q) =>
							q
								.eq('organizationMember', from.organizationMember)
								.eq('project', from.project),
					)
					.first();
			}

			default: {
				return unreachableCase(from, `Invalid from: ${JSON.stringify(from)}`);
			}
		}
	},
	(error) =>
		new UnexpectedError("while checking member's project permissions", {
			cause: error,
		}),
);

export const OrganizationMemberAuthorizedProjectRelation_get =
	protectedGetQuery(getHandler);

const listHandler = defineListHandler(
	'OrganizationMemberAuthorizedProjectRelation',
	{
		where: v.object({ organizationMember: v.id('OrganizationMember') }),
	},
	async (ctx, { where, paginationOpts }) => {
		switch (true) {
			case 'organizationMember' in where: {
				return ctx.db
					.query('OrganizationMemberAuthorizedProjectRelation')
					.withIndex(
						'by_organizationMember',
						(q) => q.eq('organizationMember', where.organizationMember),
					).paginate(paginationOpts);
			}

			default: {
				return unreachableCase(
					where,
					`Invalid where: ${JSON.stringify(where)}`,
				);
			}
		}
	},
	(error) =>
		new UnexpectedError('while listing the organization member', {
			cause: error,
		}),
);

export const OrganizationMemberAuthorizedProjectRelation_list =
	protectedListQuery(listHandler);

export const OrganizationMemberAuthorizedProjectRelation_delete =
	protectedMutation(
		'OrganizationMemberAuthorizedProjectRelation',
		{
			args: {
				input: v.object({
					id: v.id('OrganizationMemberAuthorizedProjectRelation'),
				}),
			},
			async handler(ctx, { input: { id } }) {
				const OrganizationMemberAuthorizedProjectRelation = await ctx.db.get(
					id,
				);

				if (OrganizationMemberAuthorizedProjectRelation !== null) {
					await dbDelete(
						ctx,
						'OrganizationMemberAuthorizedProjectRelation',
						id,
					);
				}
			},
			error: (error) =>
				new UnexpectedError('while deleting the organization member', {
					cause: error,
				}),
		},
	);
