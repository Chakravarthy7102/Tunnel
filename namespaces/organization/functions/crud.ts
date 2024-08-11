import { v } from '@-/convex/values';
import type { Id } from '@-/database';
import {
	applyInclude,
	dbDelete,
	dbInsert,
	dbPatch,
	defineGetHandler,
	defineListHandler,
	protectedGetQuery,
	protectedListQuery,
	protectedMutation,
} from '@-/database/function-utils';
import {
	Organization_$dashboardPageData,
	Organization_$memberProfileData,
} from '@-/database/selections';
import { vInclude } from '@-/database/validators';
import { UnexpectedError } from '@-/errors';
import {
	asanaOrganizationValidator,
	githubOrganizationValidator,
	jiraOrganizationValidator,
	linearOrganizationValidator,
	slackOrganizationValidator,
} from '@-/integrations/validators';
import { insertOrganizationMember } from '@-/organization-member/function-utils';
import { organizationMetadataValidator } from '@-/organization/validators';
import { unreachableCase } from '@tunnel/ts';
import { vNullable } from 'corvex';

export const Organization__create = protectedMutation(
	'Organization',
	{
		args: {
			input: v.object({
				organization: v.object({
					slug: v.string(),
					name: v.string(),
					workosOrganizationId: v.string(),
					profileImageUrl: vNullable(v.string()),
					svixAppId: vNullable(v.string()),
					stripeCustomerId: vNullable(v.string()),
					stripeSubscriptionId: vNullable(v.string()),
					subscriptionPlan: v.string(),
					invite: vNullable(
						v.object({
							id: vNullable(v.string()),
							createdAt: vNullable(v.number()),
						}),
					),
					githubOrganization: vNullable(githubOrganizationValidator),
					isOnboarded: v.boolean(),
					metadata: organizationMetadataValidator,
				}),
				ownerUser: v.id('User'),
				ownerWorkosOrganizationMembershipId: v.string(),
				// Should only be set to `false` during testing
				createOwnerOrganizationMember: v.boolean(),
				include: vInclude(),
			}),
		},
		async handler(
			ctx,
			{
				input: {
					ownerUser,
					ownerWorkosOrganizationMembershipId,
					organization,
					include,
					createOwnerOrganizationMember,
				},
			},
		) {
			const id = await dbInsert(
				ctx,
				'Organization',
				{
					...organization,
					isDemo: false,
					linearOrganization: null,
					slackOrganization: null,
					jiraOrganization: null,
					asanaOrganization: null,
					domain: null,
					// This is incremented when we insert the organization member
					membersCount: 0,
					projectsCount: 0,
				},
				{
					unique: {
						by_slug: ['slug'],
						by_stripeCustomerId: ['stripeCustomerId'],
					},
				},
			);

			let ownerOrganizationMemberId: Id<'OrganizationMember'> | null;
			if (createOwnerOrganizationMember !== false) {
				ownerOrganizationMemberId = await insertOrganizationMember(ctx, {
					workosOrganizationMembershipId: ownerWorkosOrganizationMembershipId,
					organization: id,
					role: 'owner',
					user: ownerUser,
				});
			} else {
				ownerOrganizationMemberId = null;
			}

			return {
				doc: await applyInclude(ctx, 'Organization', id, include),
				ownerOrganizationMemberId,
			};
		},
		error: (error) =>
			new UnexpectedError('while creating the organization', { cause: error }),
	},
);

const getHandler = defineGetHandler(
	'Organization',
	{
		from: v.union(
			v.object({ id: v.id('Organization') }),
			v.object({ workosOrganizationId: v.string() }),
			v.object({ name: v.string() }),
			v.object({ slug: v.string() }),
			v.object({ domain: v.string() }),
			v.object({ stripeCustomerId: v.string() }),
			v.object({ githubInstallationId: v.number() }),
			v.object({ inviteId: v.string() }),
		),
	},
	async (ctx, { from }) => {
		switch (true) {
			case 'id' in from: {
				return from.id;
			}

			case 'workosOrganizationId' in from: {
				return ctx.db
					.query('Organization')
					.withIndex(
						'by_workosOrganizationId',
						(q) => q.eq('workosOrganizationId', from.workosOrganizationId),
					)
					.first();
			}

			case 'domain' in from: {
				return ctx.db
					.query('Organization')
					.withIndex('by_domain', (q) => q.eq('domain', from.domain))
					.first();
			}

			case 'name' in from: {
				return ctx.db
					.query('Organization')
					.withIndex('by_name', (q) => q.eq('name', from.name))
					.first();
			}

			case 'slug' in from: {
				return ctx.db
					.query('Organization')
					.withIndex('by_slug', (q) => q.eq('slug', from.slug))
					.first();
			}

			case 'githubInstallationId' in from: {
				return ctx.db
					.query('Organization')
					.withIndex(
						'by_githubOrganizationInstallationId',
						(q) => q.eq('githubOrganization.id', from.githubInstallationId),
					)
					.first();
			}

			case 'stripeCustomerId' in from: {
				return ctx.db
					.query('Organization')
					.withIndex(
						'by_stripeCustomerId',
						(q) => q.eq('stripeCustomerId', from.stripeCustomerId),
					)
					.first();
			}

			case 'inviteId' in from: {
				return ctx.db
					.query('Organization')
					.withIndex('by_inviteId', (q) => q.eq('invite.id', from.inviteId))
					.first();
			}

			default: {
				return unreachableCase(from, `Invalid from: ${JSON.stringify(from)}`);
			}
		}
	},
	(error) =>
		new UnexpectedError('while retrieving the organization', { cause: error }),
);

export const Organization_get = protectedGetQuery(getHandler);
export const Organization_get_memberProfileData = protectedGetQuery(
	getHandler,
	Organization_$memberProfileData,
);
export const Organization_get_dashboardPageData = protectedGetQuery(
	getHandler,
	Organization_$dashboardPageData,
);

const listHandler = defineListHandler(
	'Organization',
	{
		where: v.object({ userIsMember: v.id('User') }),
	},
	async (ctx, { where, paginationOpts }) => {
		const { page: organizationMembers, continueCursor, isDone } = await ctx.db
			.query('OrganizationMember')
			.withIndex('by_user', (q) => q.eq('user', where.userIsMember))
			.paginate(paginationOpts);

		return {
			isDone,
			continueCursor,
			page: await Promise.all(
				organizationMembers.map(async (organizationMember) =>
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- Guaranteed to exist
					(await ctx.db.get(organizationMember.organization))!
				),
			),
		};
	},
	(error) =>
		new UnexpectedError('while listing organizations', { cause: error }),
);

export const Organization_list = protectedListQuery(listHandler);

export const Organization_update = protectedMutation(
	'Organization',
	{
		args: {
			input: v.object({
				id: v.id('Organization'),
				updates: v.object({
					workosOrganizationId: v.optional(v.string()),
					isOnboarded: v.optional(v.boolean()),
					name: v.optional(v.string()),
					slug: v.optional(v.string()),
					profileImageUrl: v.optional(vNullable(v.string())),
					subscriptionPlan: v.optional(v.string()),
					stripeSubscriptionId: v.optional(vNullable(v.string())),
					svixAppId: v.optional(vNullable(v.string())),
					invite: v.optional(
						vNullable(
							v.object({
								id: vNullable(v.string()),
								createdAt: vNullable(v.number()),
							}),
						),
					),
					githubOrganization: v.optional(
						vNullable(githubOrganizationValidator),
					),
					linearOrganization: v.optional(
						vNullable(linearOrganizationValidator),
					),
					slackOrganization: v.optional(vNullable(slackOrganizationValidator)),
					jiraOrganization: v.optional(vNullable(jiraOrganizationValidator)),
					asanaOrganization: v.optional(vNullable(asanaOrganizationValidator)),
				}),
			}),
		},
		async handler(ctx, { input: { id, updates } }) {
			if (updates.slug === '') {
				throw new Error('Slug cannot be empty');
			}

			await dbPatch(ctx, 'Organization', id, updates, {
				unique: {
					by_slug: ['slug'],
					by_stripeCustomerId: ['stripeCustomerId'],
				},
			});
		},
		error: (error) =>
			new UnexpectedError('while updating the organization', { cause: error }),
	},
);

export const Organization__delete = protectedMutation(
	'Organization',
	{
		args: {
			input: v.object({
				id: v.id('Organization'),
			}),
		},
		async handler(ctx, { input: { id } }) {
			await dbDelete(ctx, 'Organization', id);
		},
		error: (error) =>
			new UnexpectedError('while deleting the organization', { cause: error }),
	},
);

export const Organization_transferOwnership = protectedMutation(
	'Organization',
	{
		args: {
			input: v.object({
				oldOwnerOrganizationMember: v.id('OrganizationMember'),
				newOwnerOrganizationMember: v.id('OrganizationMember'),
			}),
		},
		async handler(
			ctx,
			{ input: { oldOwnerOrganizationMember, newOwnerOrganizationMember } },
		) {
			const oldOwner = await ctx.db.get(oldOwnerOrganizationMember);
			if (oldOwner === null) {
				throw new Error('Old owner does not exist');
			}

			if (oldOwner.role !== 'owner') {
				throw new Error('Old owner is not an owner');
			}

			const newOwner = await ctx.db.get(newOwnerOrganizationMember);
			if (newOwner === null) {
				throw new Error('New owner does not exist');
			}

			if (oldOwner.organization !== newOwner.organization) {
				throw new Error(
					'Old and new owner are not part of the same organization',
				);
			}

			await ctx.db.patch(oldOwnerOrganizationMember, {
				role: 'admin',
			});
			await ctx.db.patch(newOwnerOrganizationMember, {
				role: 'owner',
			});
		},
		error: (error) =>
			new UnexpectedError('while transferring the organization', {
				cause: error,
			}),
	},
);
