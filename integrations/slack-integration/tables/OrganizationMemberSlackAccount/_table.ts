import { v } from '@-/convex/values';
import { table, vDeprecated } from 'corvex';

export const OrganizationMemberSlackAccount = table(
	'OrganizationMemberSlackAccount',
	v.object({
		organizationMember: v.id('OrganizationMember'),

		// Slack user data
		slackId: v.string(),
		slackDisplayName: v.string(),
		slackEmail: v.string(),

		// Default properties
		accessToken: v.string(),
		cid: vDeprecated<string>('Use `_id` instead'),
	}),
	(t) =>
		t
			.index('by_cid', ['cid'])
			.index('by_organizationMember', ['organizationMember'])
			.index('by_slackId', ['slackId']),
)({
	organizationMember: {
		foreignTable: 'OrganizationMember',
		hostIndex: 'by_organizationMember',
		onDelete: 'Cascade',
	},
});
