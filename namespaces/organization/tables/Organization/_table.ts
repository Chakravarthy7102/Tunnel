import { v } from '@-/convex/values';
import type * as $ from '@-/database/tables';
import {
	asanaOrganizationValidator,
	githubOrganizationValidator,
	jiraOrganizationValidator,
	linearOrganizationValidator,
	slackOrganizationValidator,
} from '@-/integrations/validators';
import { organizationMetadataValidator } from '@-/organization/validators';
import {
	table,
	vDeprecated,
	vExcluded,
	virtualArray,
	vNew,
	vNullable,
	vTransformed,
	vVirtualArray,
} from 'corvex';

export const Organization = table(
	'Organization',
	v.object({
		/**
			`workosOrganizationId` is nullable so that we use the `v.Organization_ensureWorkosOrganization` function that makes sure the organization exists in WorkOS.
		*/
		workosOrganizationId: vNew(vNullable(v.string())),
		name: v.string(),
		slug: v.string(),
		invitations: vVirtualArray('OrganizationInvitation'),
		members: vVirtualArray('OrganizationMember'),
		membersCount: vNew(v.number()),
		projects: vVirtualArray('Project'),
		projectsCount: vNew(v.number()),
		profileImageUrl: vNullable(v.string()),
		stripeCustomerId: vNullable(v.string()),
		stripeSubscriptionId: vNullable(v.string()),
		subscriptionPlan: v.string(),
		svixAppId: vNullable(v.string()),
		invite: vNew(vNullable(v.object({
			id: vNullable(v.string()),
			createdAt: vNullable(v.number()),
		}))),
		githubOrganization: vTransformed(vNullable(githubOrganizationValidator))
			.from(v.object({
				id: v.number(),
				account: v.object({
					login: v.string(),
					avatar_url: v.string(),
					html_url: v.string(),
				}),
				html_url: v.string(),
			})),
		isOnboarded: v.boolean(),
		metadata: organizationMetadataValidator,
		// contains sensitive data (access token)
		linearOrganization: vNew(vExcluded(vNullable(linearOrganizationValidator))),
		// contains sensitive data (access token)
		slackOrganization: vNew(vExcluded(vNullable(slackOrganizationValidator))),
		// contains sensitive data (access token)
		jiraOrganization: vNew(vExcluded(vNullable(jiraOrganizationValidator))),
		asanaOrganization: vNew(vExcluded(vNullable(asanaOrganizationValidator))),
		// Used for auto-invite
		domain: vNew(vNullable(v.string())),
		// Demo organizations have permissions disabled
		isDemo: vNew(v.boolean()),

		cid: vDeprecated<string>('Use `_id` instead'),
	}),
	(t) =>
		t
			.index('by_cid', ['cid'])
			.index('by_workosOrganizationId', ['workosOrganizationId'])
			.index('by_slug', ['slug'])
			.index('by_name', ['name'])
			.index('by_stripeCustomerId', ['stripeCustomerId'])
			.index('by_githubOrganizationInstallationId', ['githubOrganization.id'])
			.index('by_domain', ['domain'])
			.index('by_inviteId', ['invite.id']),
)({
	invite: { default: () => null },
	isDemo: { default: () => false },
	githubOrganization: {
		transform: ({ githubOrganization }) =>
			githubOrganization === null ? null : ({
				...githubOrganization,
				type: '',
			}),
		isDeprecated: ({ githubOrganization }) =>
			githubOrganization !== null && !('type' in githubOrganization),
	},
	linearOrganization: { default: () => null },
	slackOrganization: { default: () => null },
	jiraOrganization: { default: () => null },
	asanaOrganization: { default: () => null },
	invitations: virtualArray<typeof $.OrganizationInvitation>(
		'OrganizationInvitation',
		'by_organization',
	),
	members: virtualArray<typeof $.OrganizationMember>(
		'OrganizationMember',
		'by_organization',
	),
	projects: virtualArray<typeof $.Project>('Project', 'by_organization'),
	domain: { default: () => null },
	workosOrganizationId: { default: () => null },
	membersCount: { default: () => 1 },
	projectsCount: { default: () => 1 },
});
