import { v } from '@-/convex/values';
import { table } from 'corvex';

export const OrganizationMemberGitlabAccount = table(
	'OrganizationMemberGitlabAccount',
	v.object({
		organizationMember: v.id('OrganizationMember'),
		organization: v.id('Organization'),

		// Github user data
		gitlabId: v.number(),
		gitlabUsername: v.string(),
		gitlabDisplayName: v.string(),
		gitlabEmail: v.string(),

		// Default properties
		accessToken: v.string(),
		refreshToken: v.string(),
		expiresIn: v.number(),
		createdAt: v.number(),
	}),
	(t) =>
		t
			.index('by_organizationMember', ['organizationMember'])
			.index('by_organization', ['organization'])
			.index('by_gitlabId', ['gitlabId'])
			.index('by_organization_gitlabId', ['organization', 'gitlabId']),
)({
	organizationMember: {
		foreignTable: 'OrganizationMember',
		hostIndex: 'by_organizationMember',
		onDelete: 'Cascade',
	},
	organization: {
		foreignTable: 'Organization',
		hostIndex: 'by_organization',
		onDelete: 'Cascade',
	},
});
