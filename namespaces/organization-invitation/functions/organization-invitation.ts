import { v } from '@-/convex/values';
import {
	applyInclude,
	dbDelete,
	dbInsert,
	dbPatch,
	defineListHandler,
	protectedListQuery,
	protectedMutation,
	protectedQuery,
} from '@-/database/function-utils';
import { OrganizationInvitation_$dashboardPageData } from '@-/database/selections';
import { vInclude } from '@-/database/validators';
import { UnexpectedError } from '@-/errors';
import { unreachableCase } from '@tunnel/ts';
import { vNullable } from 'corvex';
import uniqueBy from 'uniqbye';

export const OrganizationInvitation_create = protectedMutation(
	'OrganizationInvitation',
	{
		args: {
			input: v.object({
				data: v.object({
					recipientRole: v.union(
						v.literal('guest'),
						v.literal('member'),
						v.literal('admin'),
					),
					status: v.string(),
					organization: v.id('Organization'),
					recipientUser: vNullable(v.id('User')),
					recipientEmailAddress: vNullable(v.string()),
					senderOrganizationMember: v.id('OrganizationMember'),
				}),
				include: vInclude(),
			}),
		},
		async handler(ctx, { input: { data, include } }) {
			const { recipientEmailAddress } = data;

			// Check if the organization member already exists
			const recipientUser = await (async () => {
				if (data.recipientUser !== null) {
					return ctx.db.get(data.recipientUser);
				} else if (recipientEmailAddress !== null) {
					return ctx.db.query('User').withIndex(
						'by_email',
						(q) => q.eq('email', recipientEmailAddress),
					).first();
				} else {
					throw new Error(
						'At least one of `recipientUser` or `recipientEmailAddress` must be provided',
					);
				}
			})();

			if (recipientUser === null && data.recipientUser !== null) {
				throw new Error('Recipient user not found');
			}

			const recipientOrganizationMember = recipientUser === null ?
				null :
				await ctx.db.query(
					'OrganizationMember',
				).withIndex(
					'by_organization_user',
					(q) =>
						q.eq('organization', data.organization).eq(
							'user',
							recipientUser._id,
						),
				).first();

			if (recipientOrganizationMember !== null) {
				if (
					recipientOrganizationMember.role === 'member' &&
					data.recipientRole === 'guest'
				) {
					throw new Error("Can't invite the organization member as a guest");
				}
			}

			// If the organization invitation already exists, update it
			const organizationInvitation = await ctx.db.query(
				'OrganizationInvitation',
			).withIndex(
				'by_organization_recipientUser',
				(q) =>
					q.eq('organization', data.organization).eq(
						'recipientUser',
						data.recipientUser,
					),
			).first() ??
				await ctx.db.query(
					'OrganizationInvitation',
				).withIndex(
					'by_organization_recipientEmailAddress',
					(q) =>
						q.eq('organization', data.organization).eq(
							'recipientEmailAddress',
							data.recipientEmailAddress,
						),
				).first();

			if (organizationInvitation !== null) {
				await dbPatch(
					ctx,
					'OrganizationInvitation',
					organizationInvitation._id,
					{
						recipientRole: data.recipientRole,
					},
					{ unique: {} },
				);

				return applyInclude(
					ctx,
					'OrganizationInvitation',
					organizationInvitation._id,
					include,
				);
			} else {
				const id = await dbInsert(ctx, 'OrganizationInvitation', {
					...data,
				}, {
					unique: {
						// TODO
						// by_organization_recipientEmailAddress: [
						// 	'organization',
						// 	'recipientEmailAddress'
						// ],
						// by_organization_recipientUser: ['organization', 'recipientUser']
					},
				});

				return applyInclude(ctx, 'OrganizationInvitation', id, include);
			}
		},
		error: (error) =>
			new UnexpectedError('while creating the organization invitation', {
				cause: error,
			}),
	},
);

export const OrganizationInvitation_get = protectedQuery(
	'OrganizationInvitation',
	{
		args: {
			from: v.union(
				v.object({ id: v.id('OrganizationInvitation') }),
				v.object({ id: v.string() }),
			),
			include: vInclude(),
		},
		async handler(ctx, { from, include }) {
			switch (true) {
				case 'id' in from: {
					return applyInclude(
						ctx,
						'OrganizationInvitation',
						ctx.db.normalizeId('OrganizationInvitation', from.id),
						include,
					);
				}

				default: {
					return unreachableCase(from, `Invalid from: ${JSON.stringify(from)}`);
				}
			}
		},
		error: (error) =>
			new UnexpectedError('while retrieving the organization invitation', {
				cause: error,
			}),
	},
);

const listHandler = defineListHandler(
	'OrganizationInvitation',
	{
		where: v.union(
			v.object({ organization: v.id('Organization') }),
			v.object({ user: v.id('User') }),
			v.object({ project: v.id('Project') }),
		),
	},
	async (ctx, { where, paginationOpts }) => {
		switch (true) {
			case 'organization' in where: {
				return ctx.db
					.query('OrganizationInvitation')
					.withIndex(
						'by_organization',
						(q) => q.eq('organization', where.organization),
					)
					.order('desc')
					.paginate(paginationOpts);
			}

			case 'user' in where: {
				const user = await ctx.db.get(where.user);

				if (!user) {
					throw new Error('User does not exist');
				}

				const userInvitations = await ctx.db
					.query('OrganizationInvitation')
					.withIndex(
						'by_recipientUser',
						(q) => q.eq('recipientUser', where.user),
					)
					.collect();

				const emailInvitations = await ctx.db
					.query('OrganizationInvitation')
					.withIndex(
						'by_recipientEmailAddress',
						(q) => q.eq('recipientEmailAddress', user.email),
					).collect();

				return {
					page: uniqueBy([...userInvitations, ...emailInvitations], '_id'),
					continueCursor: '',
					isDone: true,
				};
			}

			case 'project' in where: {
				const project = await ctx.db.get(where.project);
				if (project === null) {
					return {
						page: [],
						continueCursor: '',
						isDone: true,
					};
				}

				const organizationInvitationIds = (
					await ctx.db
						.query('OrganizationInvitationAuthorizedProjectRelation')
						.withIndex(
							'by_project',
							(q) => q.eq('project', where.project),
						).collect()
				).map((relation) => relation.organizationInvitation);

				// We also list all org-wide invitations
				organizationInvitationIds.push(
					...(await ctx.db
						.query('OrganizationInvitation')
						.withIndex(
							'by_organization',
							(q) => q.eq('organization', project.organization),
						).collect()).map((invitation) => invitation._id),
				);

				return ctx.db.query('OrganizationInvitation')
					.withIndex(
						'by_organization',
						(q) => q.eq('organization', project.organization),
					)
					.filter((q) =>
						q.or(
							...organizationInvitationIds.map((organizationInvitationId) =>
								q.eq(q.field('_id'), organizationInvitationId)
							),
						)
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
		new UnexpectedError('while listing organization invitations', {
			cause: error,
		}),
);

export const OrganizationInvitation_list = protectedListQuery(listHandler);
export const OrganizationInvitation_list_dashboardPageData = protectedListQuery(
	listHandler,
	OrganizationInvitation_$dashboardPageData,
);

export const OrganizationInvitation_update = protectedMutation(
	'OrganizationInvitation',
	{
		args: {
			input: v.object({
				id: v.id('OrganizationInvitation'),
				updates: v.object({
					status: v.optional(v.string()),
					recipientUser: v.optional(v.id('User')),
				}),
			}),
		},
		async handler(ctx, { input: { id, updates } }) {
			await dbPatch(ctx, 'OrganizationInvitation', id, updates, {
				unique: {},
			});
		},
		error: (error) =>
			new UnexpectedError('while updating the organization invitation', {
				cause: error,
			}),
	},
);

export const OrganizationInvitation_delete = protectedMutation(
	'OrganizationInvitation',
	{
		args: {
			input: v.object({
				id: v.id('OrganizationInvitation'),
			}),
		},
		async handler(ctx, { input: { id } }) {
			await dbDelete(ctx, 'OrganizationInvitation', id);
		},
		error: (error) =>
			new UnexpectedError('while deleting the organization invitation', {
				cause: error,
			}),
	},
);
