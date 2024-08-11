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

/**
	A preview that proxies a local tunneled project.
*/
export const TunnelInstanceProxyPreview = table(
	'TunnelInstanceProxyPreview',
	v.object({
		gitUrl: vNullable(v.string()),
		localUrl: vNullable(v.string()),
		project: v.id('Project'),
		organization: v.id('Organization'),
		projectPath: vNullable(v.string()),
		updatedAt: v.number(),
		createdByUser: v.id('User'),
		allowedPortNumbers: v.array(v.number()),
		disallowedPortNumbers: v.array(v.number()),
		localServicePortNumber: v.number(),
		localServiceOriginalPortNumber: v.number(),
		localTunnelProxyServerPortNumber: v.number(),

		// Whether the local proxy is running and connected
		isActive: vNew(v.boolean()),

		// A proxy preview can be associated with many live previews
		projectLivePreviews: vVirtualArray('ProjectLivePreview'),

		// Deprecated properties
		parentProject: vDeprecated<unknown>('Use `project` instead'),
		name: vDeprecated<string>('Use `relativeDirpath` instead'),
		cid: vDeprecated<string>('Use `_id` instead'),
	}),
	(t) =>
		t
			.index('by_cid', ['cid'])
			.index('by_project', ['project'])
			.index('by_organization', ['organization'])
			.index('by_createdByUser_project', ['createdByUser', 'project'])
			.index('by_createdByUser', ['createdByUser']),
)({
	isActive: {
		default: () => false,
	},
	createdByUser: {
		foreignTable: 'User',
		hostIndex: 'by_createdByUser',
		onDelete: 'Cascade',
	},
	organization: {
		foreignTable: 'Organization',
		hostIndex: 'by_organization',
		onDelete: 'Cascade',
	},
	project: {
		foreignTable: 'Project',
		hostIndex: 'by_project',
		onDelete: 'Cascade',
	},
	projectLivePreviews: virtualArray<typeof $.ProjectLivePreview>(
		'ProjectLivePreview',
		'by_linkedTunnelInstanceProxyPreview',
	),
});
