/* eslint-disable no-await-in-loop -- needed to process synchronously */

import { getWorkos } from '@-/auth/workos';
import { v } from '@-/convex/values';
import { type ServerDoc } from '@-/database';
import {
	dbInsert,
	defineAction,
	protectedMutation,
} from '@-/database/function-utils';
import { getVapi } from '@-/database/vapi';
import { UnexpectedError } from '@-/errors';
import { logger } from '@-/logger';
import slugify from '@sindresorhus/slugify';
import randomInteger from 'random-int';

/**
	Ensures that a database organization has a valid WorkOS organization associated with it.
*/
export const Organization_ensureWorkosOrganization = defineAction({
	args: {
		organization: v.id('Organization'),
	},
	async handler(ctx, { organization: organizationId }) {
		const workos = getWorkos();
		const vapi = await getVapi();

		const organization = await ctx.runQuery(vapi.v.Organization_get, {
			from: { id: organizationId },
			include: {},
		}) as ServerDoc<'Organization'> | null;

		if (organization === null) {
			throw new Error('Organization not found');
		}

		if (organization.workosOrganizationId !== null) {
			try {
				return await workos.organizations.getOrganization(
					organization.workosOrganizationId,
				);
			} catch (error: any) {
				if (error.code !== 'entity_not_found') {
					throw error;
				}
			}
		}

		const { page: organizationMembers } = await ctx.runQuery(
			vapi.v.OrganizationMember_list,
			{
				where: { includeProjectGuests: true, organization: organization._id },
				include: {
					user: true,
				},
				paginationOpts: { cursor: null, numItems: 100 },
			},
		) as { page: ServerDoc<'OrganizationMember'>[] };

		// Ensure that all organization members have an existing WorkOS account
		for (const organizationMember of organizationMembers) {
			// @ts-expect-error -- Bad typings
			if (organizationMember.user.workosUserId === null) {
				logger.error(
					`Organization member ${organizationMember._id} does not have a WorkOS account in organization ${organization._id}`,
				);
			}
		}

		const workosOrganization = await workos.organizations.createOrganization({
			name: organization.name,
			allowProfilesOutsideOrganization: true,
		});

		await ctx.runMutation(vapi.v.Organization_update, {
			input: {
				id: organization._id,
				updates: {
					workosOrganizationId: workosOrganization.id,
				},
			},
		});

		for (const organizationMember of organizationMembers) {
			await workos.userManagement.createOrganizationMembership({
				organizationId: workosOrganization.id,
				// @ts-expect-error -- Bad typings
				userId: organizationMember.user.workosUserId,
				roleSlug: organizationMember.role,
			});
		}

		return workosOrganization;
	},
});

export const Organization__ensureFromWorkosOrganization = protectedMutation(
	'User',
	{
		args: {
			input: v.object({
				workosOrganization: v.object({
					id: v.string(),
					name: v.string(),
					domains: v.array(v.string()),
				}),
			}),
		},
		async handler(ctx, { input: { workosOrganization } }) {
			const organization = await ctx.db.query('Organization').withIndex(
				'by_workosOrganizationId',
				(q) => q.eq('workosOrganizationId', workosOrganization.id),
			).first();

			if (organization !== null) {
				return organization._id;
			}

			logger.debug(
				`Creating new organization with name = ${workosOrganization.name} and WorkOS Organization ID = ${workosOrganization.id}`,
			);
			// If the WorkOS user doesn't yet exist in our database, we should create a new user
			const newOrganizationId = await dbInsert(
				ctx,
				'Organization',
				{
					name: workosOrganization.name,
					slug: slugify(workosOrganization.name) + '-' + randomInteger(1000),
					isOnboarded: false,
					invite: null,
					profileImageUrl: null,
					subscriptionPlan: 'free',
					metadata: {
						ownerRole: null,
						size: null,
					},
					workosOrganizationId: workosOrganization.id,
					svixAppId: null,
					isDemo: false,
					githubOrganization: null,
					linearOrganization: null,
					slackOrganization: null,
					stripeCustomerId: null,
					stripeSubscriptionId: null,
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
						by_workosOrganizationId: ['workosOrganizationId'],
					},
				},
			);

			return newOrganizationId;
		},
		error: (error) =>
			new UnexpectedError('while creating the organization', { cause: error }),
	},
);
