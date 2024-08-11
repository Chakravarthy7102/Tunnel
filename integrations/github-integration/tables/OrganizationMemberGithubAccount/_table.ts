import { v } from '@-/convex/values';
import { table, vDeprecated } from 'corvex';

export const OrganizationMemberGithubAccount = table(
	'OrganizationMemberGithubAccount',
	v.object({
		organizationMember: v.id('OrganizationMember'),

		// Github user data
		githubId: v.string(),
		githubUsername: v.string(),
		githubDisplayName: v.string(),
		githubEmail: v.string(),

		// Default properties
		accessToken: v.string(),
		refreshToken: v.string(),
		expiresIn: v.number(),
		cid: vDeprecated<string>('Use `_id` instead'),
	}),
	(t) =>
		t
			.index('by_cid', ['cid'])
			.index('by_organizationMember', ['organizationMember'])
			.index('by_githubId', ['githubId']),
)({
	organizationMember: {
		foreignTable: 'OrganizationMember',
		hostIndex: 'by_organizationMember',
		onDelete: 'Cascade',
	},
});
