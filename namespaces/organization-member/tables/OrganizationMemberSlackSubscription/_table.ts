import { v } from '@-/convex/values';
import { table, vDeprecated, vNew, vNullable } from 'corvex';

export const OrganizationMemberSlackSubscription = table(
	'OrganizationMemberSlackSubscription',
	v.object({
		organization: v.id('Organization'),
		project: vNullable(v.id('Project')),
		organizationMember: v.id('OrganizationMember'),
		channelId: v.string(),
		channelName: vNew(v.string()),
		cid: vDeprecated<string>('Use `_id` instead'),
	}),
	(t) =>
		t
			.index('by_cid', ['cid'])
			.index('by_project', ['project'])
			.index('by_organization', ['organization'])
			.index('by_channelId', ['channelId'])
			.index('by_organizationMember', ['organizationMember']),
)({
	channelName: {
		default: () => 'default',
	},
	project: {
		foreignTable: 'Project',
		hostIndex: 'by_project',
		onDelete: 'Cascade',
	},
	organization: {
		foreignTable: 'Organization',
		hostIndex: 'by_organization',
		onDelete: 'Cascade',
	},
	organizationMember: {
		foreignTable: 'OrganizationMember',
		hostIndex: 'by_organizationMember',
		onDelete: 'Cascade',
	},
});
