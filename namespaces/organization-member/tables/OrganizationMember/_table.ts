import { organizationMemberRoleValidator } from '#validators/role.ts';
import { v } from '@-/convex/values';
import type * as $ from '@-/database/tables';
import {
	table,
	vDeprecated,
	virtual,
	virtualArray,
	vNew,
	vNullable,
	vVirtual,
	vVirtualArray,
} from 'corvex';

export const OrganizationMember = table(
	'OrganizationMember',
	v.object({
		/**
			`workosOrganizationMembershipId` is nullable so that we use the `v.OrganizationMember_ensureWorkosOrganizationMembership` function that makes sure the organization membership exists in WorkOS.
		*/
		workosOrganizationMembershipId: vNew(vNullable(v.string())),
		organization: v.id('Organization'),
		user: v.id('User'),
		sentInvitations: vVirtualArray('OrganizationInvitation'),
		role: organizationMemberRoleValidator,
		jiraMember: vDeprecated<unknown>("use 'linkedJiraAccount' instead"),
		linearMember: vDeprecated<unknown>("use 'linkedLinearAccount' instead"),
		slackMember_: vDeprecated<unknown>("use 'linkedSlackAccount' instead"),
		slackMember: vDeprecated<unknown>("use 'linkedSlackAccount' instead"),
		linkedAsanaAccount: vVirtual('OrganizationMemberAsanaAccount', {
			nullable: true,
		}),
		linkedJiraAccount: vVirtual('OrganizationMemberJiraAccount', {
			nullable: true,
		}),
		linkedLinearAccount: vVirtual(
			'OrganizationMemberLinearAccount',
			{ nullable: true },
		),
		linkedSlackAccount: vVirtual('OrganizationMemberSlackAccount', {
			nullable: true,
		}),
		linkedGithubAccount: vVirtual(
			'OrganizationMemberGithubAccount',
			{ nullable: true },
		),
		linkedGitlabAccount: vVirtual(
			'OrganizationMemberGitlabAccount',
			{ nullable: true },
		),
		authorizedProjectRelations: vVirtualArray(
			'OrganizationMemberAuthorizedProjectRelation',
		),
		cid: vDeprecated<string>('Use `_id` instead'),
	}),
	(t) =>
		t
			.index('by_cid', ['cid'])
			.index('by_organization', ['organization'])
			.index('by_user', ['user'])
			.index('by_organization_user', ['organization', 'user'])
			.index('by_linkedSlackAccount', ['linkedSlackAccount'])
			.index('by_linkedJiraAccount', ['linkedJiraAccount'])
			.index('by_linkedLinearAccount', ['linkedLinearAccount'])
			.index('by_linkedGithubAccount', ['linkedGithubAccount'])
			.index('by_linkedGitlabAccount', ['linkedGitlabAccount'])
			.index('by_workosOrganizationMembershipId', [
				'workosOrganizationMembershipId',
			]),
)({
	organization: {
		foreignTable: 'Organization',
		hostIndex: 'by_organization',
		onDelete: 'Cascade',
	},
	sentInvitations: virtualArray<typeof $.OrganizationInvitation>(
		'OrganizationInvitation',
		'by_senderOrganizationMember',
	),
	user: {
		foreignTable: 'User',
		hostIndex: 'by_user',
		onDelete: 'Cascade',
	},
	linkedAsanaAccount: virtual<typeof $.OrganizationMemberAsanaAccount>(
		'OrganizationMemberAsanaAccount',
		'by_organizationMember',
	),
	linkedJiraAccount: virtual<typeof $.OrganizationMemberJiraAccount>(
		'OrganizationMemberJiraAccount',
		'by_organizationMember',
	),
	linkedLinearAccount: virtual<typeof $.OrganizationMemberLinearAccount>(
		'OrganizationMemberLinearAccount',
		'by_organizationMember',
	),
	linkedSlackAccount: virtual<typeof $.OrganizationMemberSlackAccount>(
		'OrganizationMemberSlackAccount',
		'by_organizationMember',
	),
	linkedGithubAccount: virtual<typeof $.OrganizationMemberGithubAccount>(
		'OrganizationMemberGithubAccount',
		'by_organizationMember',
	),
	linkedGitlabAccount: virtual<typeof $.OrganizationMemberGitlabAccount>(
		'OrganizationMemberGitlabAccount',
		'by_organizationMember',
	),
	authorizedProjectRelations: virtualArray<
		typeof $.OrganizationMemberAuthorizedProjectRelation
	>('OrganizationMemberAuthorizedProjectRelation', 'by_organizationMember'),
	workosOrganizationMembershipId: {
		default: () => null,
	},
});
