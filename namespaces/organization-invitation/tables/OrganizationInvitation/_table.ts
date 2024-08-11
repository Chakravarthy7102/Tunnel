import type * as $ from '#tables/_.tables.ts';
import { v } from '@-/convex/values';
import {
	table,
	vDeprecated,
	virtualArray,
	vNullable,
	vVirtualArray,
} from 'corvex';

export const OrganizationInvitation = table(
	'OrganizationInvitation',
	v.object({
		organization: v.id('Organization'),
		recipientEmailAddress: vNullable(v.string()),
		recipientRole: v.union(
			v.literal('guest'),
			v.literal('member'),
			v.literal('admin'),
		),
		recipientUser: vNullable(v.id('User')),
		senderOrganizationMember: v.id('OrganizationMember'),
		status: v.string(),
		authorizedProjectRelations: vVirtualArray(
			'OrganizationInvitationAuthorizedProjectRelation',
		),

		cid: vDeprecated<string>('Use `_id` instead'),
	}),
	(t) =>
		t
			.index('by_cid', ['cid'])
			.index('by_senderOrganizationMember', ['senderOrganizationMember'])
			.index('by_recipientUser', ['recipientUser'])
			.index('by_organization', ['organization'])
			.index('by_organization_recipientUser', ['organization', 'recipientUser'])
			.index('by_organization_recipientEmailAddress', [
				'organization',
				'recipientEmailAddress',
			])
			.index('by_recipientEmailAddress', ['recipientEmailAddress']),
)({
	organization: {
		foreignTable: 'Organization',
		hostIndex: 'by_organization',
		onDelete: 'Cascade',
	},
	recipientUser: {
		foreignTable: 'User',
		hostIndex: 'by_recipientUser',
		onDelete: 'Cascade',
	},
	senderOrganizationMember: {
		foreignTable: 'OrganizationMember',
		hostIndex: 'by_senderOrganizationMember',
		onDelete: 'Cascade',
	},
	authorizedProjectRelations: virtualArray<
		typeof $.OrganizationInvitationAuthorizedProjectRelation
	>(
		'OrganizationInvitationAuthorizedProjectRelation',
		'by_organizationInvitation',
	),
});
