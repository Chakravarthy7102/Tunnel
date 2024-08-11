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

export const OrganizationInvitationAuthorizedProjectRelation_create =
	protectedMutation(
		'OrganizationInvitationAuthorizedProjectRelation',
		{
			args: {
				input: v.object({
					data: v.object({
						organizationInvitation: v.id('OrganizationInvitation'),
						project: v.id('Project'),
					}),
					include: vInclude(),
				}),
			},
			async handler(ctx, { input: { data, include } }) {
				const id = await dbInsert(
					ctx,
					'OrganizationInvitationAuthorizedProjectRelation',
					data,
					{
						unique: {
							by_organizationInvitation_project: [
								'organizationInvitation',
								'project',
							],
						},
					},
				);
				return applyInclude(
					ctx,
					'OrganizationInvitationAuthorizedProjectRelation',
					id,
					include,
				);
			},
			error: (error) =>
				new UnexpectedError('while adding project relation to invitation', {
					cause: error,
				}),
		},
	);

const getHandler = defineGetHandler(
	'OrganizationInvitationAuthorizedProjectRelation',
	{
		from: v.union(
			v.object({ id: v.id('OrganizationInvitationAuthorizedProjectRelation') }),
			v.object({
				organizationInvitation: v.id('OrganizationInvitation'),
				project: v.id('Project'),
			}),
		),
	},
	async (ctx, { from }) => {
		switch (true) {
			case 'id' in from: {
				return from.id;
			}

			case 'organizationInvitation' in from && 'project' in from: {
				return ctx.db
					.query('OrganizationInvitationAuthorizedProjectRelation')
					.withIndex(
						'by_organizationInvitation_project',
						(q) =>
							q
								.eq('organizationInvitation', from.organizationInvitation)
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
		new UnexpectedError("while checking invitation's project permissions", {
			cause: error,
		}),
);

export const OrganizationInvitationAuthorizedProjectRelation_get =
	protectedGetQuery(
		getHandler,
	);

const listHandler = defineListHandler(
	'OrganizationInvitationAuthorizedProjectRelation',
	{
		where: v.object({ organizationInvitation: v.id('OrganizationInvitation') }),
	},
	async (ctx, { where, paginationOpts }) => {
		switch (true) {
			case 'organizationInvitation' in where: {
				return ctx.db
					.query('OrganizationInvitationAuthorizedProjectRelation')
					.withIndex(
						'by_organizationInvitation',
						(q) => q.eq('organizationInvitation', where.organizationInvitation),
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
		new UnexpectedError('while listing the organization invitation', {
			cause: error,
		}),
);

export const OrganizationInvitationAuthorizedProjectRelation_list =
	protectedListQuery(
		listHandler,
	);

export const OrganizationInvitationAuthorizedProjectRelation_delete =
	protectedMutation(
		'OrganizationInvitationAuthorizedProjectRelation',
		{
			args: {
				input: v.object({
					id: v.id('OrganizationInvitationAuthorizedProjectRelation'),
				}),
			},
			async handler(ctx, { input: { id } }) {
				const OrganizationInvitationAuthorizedProjectRelation = await ctx.db
					.get(
						id,
					);

				if (OrganizationInvitationAuthorizedProjectRelation !== null) {
					await dbDelete(
						ctx,
						'OrganizationInvitationAuthorizedProjectRelation',
						id,
					);
				}
			},
			error: (error) =>
				new UnexpectedError('while deleting the organization invitation', {
					cause: error,
				}),
		},
	);
