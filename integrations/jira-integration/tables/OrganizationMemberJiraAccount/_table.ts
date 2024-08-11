import { v } from '@-/convex/values';
import { table, vDeprecated } from 'corvex';

export const OrganizationMemberJiraAccount = table(
	'OrganizationMemberJiraAccount',
	v.object({
		organizationMember: v.id('OrganizationMember'),

		// Jira user data
		jiraId: v.string(),
		jiraEmailAddress: v.string(),
		jiraDisplayName: v.string(),
		jiraCloudId: v.string(),

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
			.index('by_jiraId', ['jiraId']),
)({
	organizationMember: {
		foreignTable: 'OrganizationMember',
		hostIndex: 'by_organizationMember',
		onDelete: 'Cascade',
	},
});
