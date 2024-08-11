import { v } from '@-/convex/values';
import { table, vDeprecated, vNew } from 'corvex';

export const ProjectSlackMessage = table(
	'ProjectSlackMessage',
	v.object({
		project: v.id('Project'),
		organization: v.id('Organization'),

		// Slack message information
		channelId: v.string(),
		messageId: v.string(),
		permalink: v.string(),
		channelName: vNew(v.string()),
		cid: vDeprecated<string>('Use `_id` instead'),
	}),
	(t) =>
		t
			.index('by_cid', ['cid'])
			.index('by_project', ['project'])
			.index('by_organization', ['organization'])
			.index('by_channelId', ['channelId'])
			.index('by_messageId', ['messageId'])
			.index('by_permalink', ['permalink']),
)({
	channelName: { default: () => 'default' },
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
});
