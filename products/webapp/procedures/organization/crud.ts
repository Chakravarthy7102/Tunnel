import { WebappApiInput } from '#api-input';
import { defineProcedure } from '#utils/procedure.ts';
import { ApiConvex } from '@-/convex/api';
import { DocumentNotFoundError, ProcedureError } from '@-/errors';
import {
	asanaOrganizationSchema,
	githubOrganizationSchema,
	jiraOrganizationSchema,
	linearOrganizationSchema,
	slackOrganizationSchema,
} from '@-/integrations/schemas';
import { OrganizationMemberRoleInput } from '@-/organization-member';
import { ApiOrganization } from '@-/organization/api';
import { organizationMetadataSchema } from '@-/organization/schemas';
import { getStripeInstance } from '@-/stripe';
import { z } from '@-/zod';
import { init } from '@paralleldrive/cuid2';
import { unreachableCase } from '@tunnel/ts';
import { $try, err, ok } from 'errok';
import { DateTime } from 'luxon';

export const organization_create = defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.object({
			ownerUser: WebappApiInput.user({
				actor,
				actorRelation: 'actor',
			})(input, ctx),
			name: z.string(),
			slug: WebappApiInput.organizationSlug(),
			metadata: organizationMetadataSchema,
		})),
	mutation: async ({ input }) => ($try(async function*() {
		const slug = yield* input.slug.safeUnwrap();
		const ownerUser = yield* input.ownerUser.safeUnwrap();

		// Check if an organization with the provided slug already exists
		const existingOrganization = yield* ApiConvex.v.Organization.get({
			from: { slug },
			include: {},
		}).safeUnwrap();

		if (existingOrganization !== null) {
			return err(
				new Error(`Organization with slug "${slug}" already exists`),
			);
		}

		const createInviteId = init({
			random: Math.random,
			length: 12,
		});

		const organizationData = yield* ApiOrganization.create({
			input: {
				organization: {
					profileImageUrl: null,
					name: input.name,
					slug,
					subscriptionPlan: 'free',
					metadata: input.metadata,
					githubOrganization: null,
					invite: {
						id: createInviteId(),
						createdAt: DateTime.now().toSeconds(),
					},
				},
				ownerUser,
				include: {},
			},
		}).safeUnwrap();

		return ok(organizationData);
	})),
	error: ({ error }) =>
		new ProcedureError("Couldn't create organization", error),
});

export const organization_get = defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.union([
			z.object({
				organization: WebappApiInput.organization({
					actor,
					actorOrganizationMemberRole:
						OrganizationMemberRoleInput.memberOrHigher,
					plans: 'any',
				})(input, ctx),
			}),
			z.object({
				slug: z.string(),
			}),
		])),
	query: async ({ input }) => ($try(async function*() {
		switch (true) {
			case 'organization' in input: {
				const organizationId = yield* input.organization.safeUnwrap();
				return ApiConvex.v.Organization.get({
					from: { id: organizationId },
					include: {},
				});
			}

			case 'slug' in input: {
				return ApiConvex.v.Organization.get({
					from: { slug: input.slug },
					include: {},
				});
			}

			default: {
				return unreachableCase(input);
			}
		}
	})),
	error: ({ error }) => new ProcedureError("Couldn't get organization", error),
});

export const organization_update = defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.object({
			organization: WebappApiInput.organization({
				actor,
				actorOrganizationMemberRole: OrganizationMemberRoleInput.adminOrHigher,
				plans: 'any',
			})(input, ctx),
			updates: z.object({
				name: WebappApiInput.organizationName().optional(),
				slug: WebappApiInput.organizationSlug().optional(),
				profileImageUrl: z.string().optional(),
				isOnboarded: z.boolean().optional(),
				invite: z.object({
					id: z.string(),
					createdAt: z.number(),
				}).nullable().optional(),
				linearOrganization: linearOrganizationSchema.nullable().optional(),
				githubOrganization: githubOrganizationSchema.nullable().optional(),
				slackOrganization: slackOrganizationSchema.nullable().optional(),
				jiraOrganization: jiraOrganizationSchema.nullable().optional(),
				asanaOrganization: asanaOrganizationSchema.nullable().optional(),
			}),
		})),
	mutation: async ({ input }) => ($try(async function*() {
		const organizationId = yield* input.organization.safeUnwrap();

		const stripe = getStripeInstance();
		const name = input.updates.name === undefined ?
			undefined :
			yield* input.updates.name.safeUnwrap();
		const slug = input.updates.slug === undefined ?
			undefined :
			yield* input.updates.slug.safeUnwrap();

		const organization = yield* ApiConvex.v.Organization.get({
			from: { id: organizationId },
			include: {},
		}).safeUnwrap();

		if (organization === null) {
			return err(new DocumentNotFoundError('Organization'));
		}

		if (
			organization.stripeCustomerId && name !== organization.name
		) {
			await stripe.customers.update(organization.stripeCustomerId, {
				name,
			});
		}

		return ApiConvex.v.Organization.update({
			input: {
				id: organizationId,
				updates: {
					...input.updates,
					name,
					slug,
				},
			},
		});
	})),
	error: ({ error }) =>
		new ProcedureError("Couldn't update organization", error),
});

export const organization_deactivate = defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.object({
			organization: WebappApiInput.organization({
				actor,
				actorOrganizationMemberRole: OrganizationMemberRoleInput.ownerOnly,
				plans: 'any',
			})(input, ctx),
		})),
	mutation: async ({ input }) => ($try(async function*() {
		const organizationId = yield* input.organization.safeUnwrap();
		return ApiOrganization.deactivate({ organizationId });
	})),
	error: ({ error }) =>
		new ProcedureError("Couldn't deactivate organization", error),
});

export const organization_delete = defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.object({
			organization: WebappApiInput.organization({
				actor,
				actorOrganizationMemberRole: OrganizationMemberRoleInput.ownerOnly,
				plans: 'any',
			})(input, ctx),
		})),
	mutation: async ({ input }) => ($try(async function*() {
		const organizationId = yield* input.organization.safeUnwrap();

		return ApiOrganization.delete({
			input: {
				id: organizationId,
			},
		});
	})),
	error: ({ error }) =>
		new ProcedureError("Couldn't delete organization", error),
});
