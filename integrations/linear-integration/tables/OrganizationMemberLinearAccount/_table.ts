import { v } from '@-/convex/values';
import { table, vDeprecated } from 'corvex';

export const OrganizationMemberLinearAccount = table(
	'OrganizationMemberLinearAccount',
	v.object({
		organizationMember: v.id('OrganizationMember'),

		// Linear user data
		linearId: v.string(),
		linearUsername: v.string(),
		linearDisplayName: v.string(),
		linearEmail: v.string(),

		// Default properties
		accessToken: v.string(),
		cid: vDeprecated<string>('Use `_id` instead'),
	}),
	(t) =>
		t
			.index('by_cid', ['cid'])
			.index('by_organizationMember', ['organizationMember'])
			.index('by_linearId', ['linearId']),
)({
	organizationMember: {
		foreignTable: 'OrganizationMember',
		hostIndex: 'by_organizationMember',
		onDelete: 'Cascade',
	},
});
