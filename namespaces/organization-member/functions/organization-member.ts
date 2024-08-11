import { insertOrganizationMember } from '#function-utils/insert.ts';
import { organizationMemberRoleValidator } from '#validators/role.ts';
import { v } from '@-/convex/values';
import {
	applyInclude,
	dbDelete,
	dbPatch,
	defineGetHandler,
	defineListHandler,
	protectedGetQuery,
	protectedListQuery,
	protectedMutation,
} from '@-/database/function-utils';
import {
	OrganizationMember_$actorProfileData,
	OrganizationMember_$commentsProviderData,
	OrganizationMember_$dashboardPageData,
	OrganizationMember_$organizationData,
	OrganizationMember_$userData,
} from '@-/database/selections';
import { vInclude } from '@-/database/validators';
import { UnexpectedError } from '@-/errors';
import { unreachableCase } from '@tunnel/ts';

export const OrganizationMember__create = protectedMutation(
	'OrganizationMember',
	{
		args: {
			input: v.object({
				data: v.object({
					workosOrganizationMembershipId: v.string(),
					organization: v.id('Organization'),
					role: organizationMemberRoleValidator,
					user: v.id('User'),
				}),
				include: vInclude(),
			}),
		},
		async handler(ctx, { input: { data, include } }) {
			const id = await insertOrganizationMember(ctx, data);
			return applyInclude(ctx, 'OrganizationMember', id, include);
		},
		error: (error) =>
			new UnexpectedError('while creating the organization member', {
				cause: error,
			}),
	},
);

const getHandler = defineGetHandler(
	'OrganizationMember',
	{
		from: v.union(
			v.object({ id: v.id('OrganizationMember') }),
			v.object({ workosOrganizationMembershipId: v.string() }),
			v.object({
				user: v.id('User'),
				organization: v.id('Organization'),
			}),
			v.object({
				slackId: v.string(),
			}),
			v.object({
				gitlabId: v.number(),
				organization: v.id('Organization'),
			}),
		),
	},
	async (ctx, { from }) => {
		switch (true) {
			case 'id' in from: {
				return from.id;
			}

			case 'workosOrganizationMembershipId' in from: {
				return ctx.db
					.query('OrganizationMember')
					.withIndex(
						'by_workosOrganizationMembershipId',
						(q) =>
							q.eq(
								'workosOrganizationMembershipId',
								from.workosOrganizationMembershipId,
							),
					)
					.first();
			}

			case 'user' in from && 'organization' in from: {
				return ctx.db
					.query('OrganizationMember')
					.withIndex(
						'by_organization_user',
						(q) =>
							q.eq('organization', from.organization).eq('user', from.user),
					)
					.first();
			}

			case 'slackId' in from: {
				// this should be unique, but for some reason it isn't rn
				const organizationMembers = await ctx.db
					.query('OrganizationMemberSlackAccount')
					.withIndex(
						'by_slackId',
						(q) => q.eq('slackId', from.slackId),
					)
					.collect();

				return organizationMembers.length > 0 &&
						organizationMembers[0] !== undefined ?
					organizationMembers[0].organizationMember :
					null;
			}

			case 'gitlabId' in from: {
				const organizationMemberGitlabAccount = await ctx.db
					.query('OrganizationMemberGitlabAccount')
					.withIndex(
						'by_organization_gitlabId',
						(q) =>
							q
								.eq('organization', from.organization)
								.eq('gitlabId', from.gitlabId),
					)
					.unique();

				const organizationMember = organizationMemberGitlabAccount ?
					organizationMemberGitlabAccount.organizationMember :
					null;

				return organizationMember;
			}

			default: {
				return unreachableCase(from, `Invalid from: ${JSON.stringify(from)}`);
			}
		}
	},
	(error) =>
		new UnexpectedError('while retrieving the organization member', {
			cause: error,
		}),
);

export const OrganizationMember_get = protectedGetQuery(getHandler);
export const OrganizationMember_get_dashboardPageData = protectedGetQuery(
	getHandler,
	OrganizationMember_$dashboardPageData,
);
export const OrganizationMember_get_userData = protectedGetQuery(
	getHandler,
	OrganizationMember_$userData,
);
export const OrganizationMember_get_actorProfileData = protectedGetQuery(
	getHandler,
	OrganizationMember_$actorProfileData,
);
export const OrganizationMember_get_commentsProviderData = protectedGetQuery(
	getHandler,
	OrganizationMember_$commentsProviderData,
);

const listHandler = defineListHandler(
	'OrganizationMember',
	{
		where: v.union(
			v.object({
				organization: v.id('Organization'),
				includeProjectGuests: v.union(
					v.boolean(),
					v.array(v.id('Project')),
				),
			}),
			v.object({
				user: v.id('User'),
				includeProjectGuests: v.union(v.boolean(), v.array(v.id('Project'))),
			}),
		),
	},
	async (ctx, { where, paginationOpts }) => {
		switch (true) {
			case 'user' in where: {
				let query = ctx.db
					.query('OrganizationMember')
					.withIndex('by_user', (q) => q.eq('user', where.user));

				if (where.includeProjectGuests === false) {
					query = query.filter((q) => q.neq(q.field('role'), 'guest'));
				} else if (Array.isArray(where.includeProjectGuests)) {
					const organizationMemberIds = (await Promise.all(
						where.includeProjectGuests.map(
							async (projectId) =>
								(await ctx.db.query(
									'OrganizationMemberAuthorizedProjectRelation',
								).withIndex(
									'by_project',
									(q) => q.eq('project', projectId),
								).collect()).map((relation) => relation.organizationMember),
						),
					)).flat();

					query = query.filter((q) =>
						q.or(
							// Include all member or higher
							q.neq(q.field('role'), 'guest'),
							// Include organization members with those projects
							...organizationMemberIds.map((id) => q.eq(q.field('_id'), id)),
						)
					);
				}

				return query.paginate(paginationOpts);
			}

			case 'organization' in where: {
				let query = ctx.db
					.query('OrganizationMember')
					.withIndex(
						'by_organization',
						(q) => q.eq('organization', where.organization),
					);

				if (where.includeProjectGuests === false) {
					query = query.filter((q) => q.neq(q.field('role'), 'guest'));
				} else if (Array.isArray(where.includeProjectGuests)) {
					const organizationMemberIds = (await Promise.all(
						where.includeProjectGuests.map(
							async (projectId) =>
								(await ctx.db.query(
									'OrganizationMemberAuthorizedProjectRelation',
								).withIndex(
									'by_project',
									(q) => q.eq('project', projectId),
								).collect()).map((relation) => relation.organizationMember),
						),
					)).flat();

					query = query.filter((q) =>
						q.or(
							// Include all member or higher
							q.neq(q.field('role'), 'guest'),
							// Include organization members with those projects
							...organizationMemberIds.map((id) => q.eq(q.field('_id'), id)),
						)
					);
				}

				return query.paginate(paginationOpts);
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

export const OrganizationMember_list = protectedListQuery(listHandler);
export const OrganizationMember_list_dashboardPageData = protectedListQuery(
	listHandler,
	OrganizationMember_$dashboardPageData,
);
export const OrganizationMember_list_userData = protectedListQuery(
	listHandler,
	OrganizationMember_$userData,
);
export const OrganizationMember_list_organizationData = protectedListQuery(
	listHandler,
	OrganizationMember_$organizationData,
);
export const OrganizationMember_list_actorProfileData = protectedListQuery(
	listHandler,
	OrganizationMember_$actorProfileData,
);

export const OrganizationMember__ensureFromWorkosOrganizationMembership =
	protectedMutation(
		'OrganizationMember',
		{
			args: {
				input: v.object({
					workosOrganizationMembership: v.object({
						id: v.string(),
						userId: v.string(),
						organizationId: v.string(),
						role: organizationMemberRoleValidator,
					}),
				}),
			},
			async handler(ctx, { input: { workosOrganizationMembership } }) {
				const organization = await ctx.db.query('Organization').withIndex(
					'by_workosOrganizationId',
					(q) =>
						q.eq(
							'workosOrganizationId',
							workosOrganizationMembership.organizationId,
						),
				).first();

				if (organization === null) {
					throw new Error('Organization not found');
				}

				const user = await ctx.db.query('User').withIndex(
					'by_workosUserId',
					(q) => q.eq('workosUserId', workosOrganizationMembership.userId),
				).first();

				if (user === null) {
					throw new Error('Organization or User not found');
				}

				const organizationMember = await ctx.db.query('OrganizationMember')
					.withIndex(
						'by_organization_user',
						(q) =>
							q
								.eq('organization', organization._id)
								.eq('user', user._id),
					).first();

				if (organizationMember !== null) {
					return organizationMember._id;
				}

				const organizationMemberId = await insertOrganizationMember(ctx, {
					organization: organization._id,
					role: workosOrganizationMembership.role,
					user: user._id,
					workosOrganizationMembershipId: workosOrganizationMembership.id,
				});

				return organizationMemberId;
			},
			error: (error) =>
				new UnexpectedError('while ensuring the organization member', {
					cause: error,
				}),
		},
	);

export const OrganizationMember_update = protectedMutation(
	'OrganizationMember',
	{
		args: {
			input: v.object({
				id: v.id('OrganizationMember'),
				updates: v.object({
					role: v.optional(organizationMemberRoleValidator),
				}),
			}),
		},
		async handler(ctx, { input: { id, updates: updatesInput } }) {
			await dbPatch(ctx, 'OrganizationMember', id, updatesInput, {
				unique: {
					by_organization_user: ['organization', 'user'],
				},
			});
		},
		error: (error) =>
			new UnexpectedError('while updating the organization member', {
				cause: error,
			}),
	},
);

export const OrganizationMember_delete = protectedMutation(
	'OrganizationMember',
	{
		args: {
			input: v.object({
				id: v.id('OrganizationMember'),
			}),
		},
		async handler(ctx, { input: { id } }) {
			const organizationMember = await ctx.db.get(id);

			if (organizationMember !== null) {
				await dbDelete(ctx, 'OrganizationMember', id);
			}
		},
		error: (error) =>
			new UnexpectedError('while deleting the organization member', {
				cause: error,
			}),
	},
);

// /**
// 	Ensures that an organization member in our database has a valid WorkOS organization membership associated with them.
// */
// export const User_ensureWorkosUser = defineAction({
// 	args: {
// 		user: v.id('User'),
// 	},
// 	async handler(ctx, { user: userId }) {
// 		const workos = getWorkos();
// 		const user = await ctx.runQuery(
// 			vapi.v.User_get,
// 			{
// 				from: { id: userId },
// 				include: {},
// 			},
// 		) as ServerDoc<'User'> | null;

// 		if (user === null) {
// 			throw new Error('User not found');
// 		}

// 		if (user.workosUserId !== null) {
// 			try {
// 				return await workos.userManagement.getUser(user.workosUserId);
// 			} catch (error: any) {
// 				if (error.code !== 'entity_not_found') {
// 					throw error;
// 				}
// 			}
// 		}

// 		// The `workosUserId` is invalid, so we try to create a new WorkOS user with the given email
// 		try {
// 			const workosUser = await workos.userManagement.createUser({
// 				email: user.email,
// 				emailVerified: true,
// 				firstName: user.fullName.split(' ')[0],
// 				lastName: user.fullName.split(' ')[1],
// 			});

// 			return workosUser;
// 		} catch (error: any) {
// 			if (
// 				error.code === 'user_creation_error' &&
// 				error.errors.some((error: any) => error.code === 'email_not_available')
// 			) {
// 				const { data } = await workos.userManagement.listUsers({
// 					email: user.email,
// 				});

// 				const workosUser = data[0];
// 				if (workosUser === undefined) {
// 					throw new Error(
// 						'Unexpected issue while creating WorkOS user',
// 						{ cause: error },
// 					);
// 				}

// 				return workosUser;
// 			} else {
// 				throw error;
// 			}
// 		}
// 	},
// });
