import { v } from '@-/convex/values';
import { table, vDeprecated } from 'corvex';

export const OrganizationMemberAsanaAccount = table(
	'OrganizationMemberAsanaAccount',
	v.object({
		organizationMember: v.id('OrganizationMember'),

		// Asana user data
		asanaGid: v.string(),
		asanaName: v.string(),
		asanaEmail: v.string(),

		// Default properties
		accessToken: v.string(),
		refreshToken: v.string(),
		expiresIn: v.number(),
		createdAt: v.number(),
		cid: vDeprecated<string>('Use `_id` instead'),
	}),
	(t) =>
		t
			.index('by_cid', ['cid'])
			.index('by_organizationMember', ['organizationMember'])
			.index('by_asanaGid', ['asanaGid']),
)({
	organizationMember: {
		foreignTable: 'OrganizationMember',
		hostIndex: 'by_organizationMember',
		onDelete: 'Cascade',
	},
});
