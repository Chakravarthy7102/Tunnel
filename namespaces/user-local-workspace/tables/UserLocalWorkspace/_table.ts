import { v } from '@-/convex/values';
import { table, vDeprecated, vNullable } from 'corvex';

/**
	A local workspace is a portion of a Tunnel project's codebase that lives on a user's personal computer. We save information about the user's local workspace in the cloud so that the Tunnel configuration for this workspace can be synchronized across multiple computers.

	For example:
	```shell
		user@computer-1 my-app % tunnel share ./frontend
		# The Tunnel CLI can't find a `UserLocalWorkspace` document that corresponds to the "./frontend" relative path, so it creates a new `UserLocalWorkspace` document for the user with `{ relativeDirpath: "./frontend" }`
		> Tunnel URL: https://funny-carrots-fly.tunnelapp.dev

		user@computer-2 my-app % tunnel share ./frontend
		# The Tunnel CLI finds an existing `UserLocalWorkspace` document that corresponds to the "./frontend" relative path, so it reuses the existing `UserLocalWorkspace` document
		> Tunnel URL: https://funny-carrots-fly.tunnelapp.dev
	```
*/
export const UserLocalWorkspace = table(
	'UserLocalWorkspace',
	v.object({
		user: v.id('User'),
		project: v.id('Project'),
		relativeDirpath: v.string(),
		linkedTunnelInstanceProxyPreview: vNullable(
			v.id('TunnelInstanceProxyPreview'),
		),

		cid: vDeprecated<string>('Use `_id` instead'),
	}),
	(t) =>
		t
			.index('by_cid', ['cid'])
			.index('by_user', ['user'])
			.index('by_linkedTunnelInstanceProxyPreview', [
				'linkedTunnelInstanceProxyPreview',
			])
			.index('by_project', ['project'])
			.index('by_relativeDirpath', ['relativeDirpath'])
			.index('by_project_relativeDirpath_user', [
				'project',
				'relativeDirpath',
				'user',
			]),
)({
	user: {
		foreignTable: 'User',
		hostIndex: 'by_user',
		onDelete: 'Cascade',
	},
	project: {
		foreignTable: 'Project',
		hostIndex: 'by_project',
		onDelete: 'Cascade',
	},
	linkedTunnelInstanceProxyPreview: {
		foreignTable: 'TunnelInstanceProxyPreview',
		hostIndex: 'by_linkedTunnelInstanceProxyPreview',
		onDelete: 'Cascade',
	},
});
