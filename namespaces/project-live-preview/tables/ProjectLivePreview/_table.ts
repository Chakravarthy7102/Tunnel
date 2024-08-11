import { v } from '@-/convex/values';
import type * as $ from '@-/database/tables';
import {
	table,
	vDeprecated,
	virtualArray,
	vNew,
	vNullable,
	vVirtualArray,
} from 'corvex';

export const ProjectLivePreview = table(
	'ProjectLivePreview',
	v.object({
		slug: vNew(v.string()),
		allowsAnonymousUsers: v.boolean(),
		dailyRoomName: v.string(),
		liveshareLink: vNullable(v.string()),
		project: v.id('Project'),
		organization: v.id('Organization'),
		viewPermission: v.string(),
		url: v.string(),
		linkedTunnelInstanceProxyPreview: vNew(
			vNullable(v.id('TunnelInstanceProxyPreview')),
		),
		linkedProjectCommentThreads: vVirtualArray('ProjectCommentThread'),
		createdByUser: vNew(vNullable(v.id('User'))),
		isLive: vNew(v.boolean()),

		/** @deprecated */
		cid: vDeprecated<string>('Use `_id` instead'),
	}),
	(t) =>
		t
			.index('by_cid', ['cid'])
			.index('by_createdByUser', ['createdByUser'])
			.index('by_project', ['project'])
			.index('by_organization', ['organization'])
			.index('by_slug', ['slug'])
			.index('by_linkedTunnelInstanceProxyPreview', [
				'linkedTunnelInstanceProxyPreview',
			])
			.index('by_url', ['url'])
			.index('by_project_url', ['project', 'url']),
)({
	slug: {
		default: (doc) => doc.cid as any,
	},
	isLive: {
		default: () => false,
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
	linkedProjectCommentThreads: virtualArray<typeof $.ProjectCommentThread>(
		'ProjectCommentThread',
		'by_linkedProjectLivePreview',
	),
	createdByUser: {
		default: () => null,
		onDelete: 'SetNull',
		foreignTable: 'User',
		hostIndex: 'by_createdByUser',
	},
	linkedTunnelInstanceProxyPreview: {
		default: () => null,
		foreignTable: 'TunnelInstanceProxyPreview',
		hostIndex: 'by_linkedTunnelInstanceProxyPreview',
		onDelete: 'Cascade',
	},
});
