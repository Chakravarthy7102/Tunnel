import type {
	CreateLocalProxyContextArgs,
	NarrowLocalProxyContextArgs,
} from '#types';
import type { Id } from '@-/database';
import {
	defineProperties,
	type IfExtends,
	type NullProperties,
} from '@tunnel/context';

interface TunnelInstanceProxyPreviewProperties {
	userLocalWorkspaceId: Id<'UserLocalWorkspace'>;
	projectLivePreviewId: Id<'ProjectLivePreview'>;
	tunnelInstanceProxyPreviewId: Id<'TunnelInstanceProxyPreview'>;
}

// dprint-ignore
type ContextTunnelInstanceProxyPreviewProperties<
	$Args extends NarrowLocalProxyContextArgs = NarrowLocalProxyContextArgs
> =
	IfExtends<true, $Args['hasProjectLivePreview'], TunnelInstanceProxyPreviewProperties> |
	IfExtends<
		false,
		$Args['hasProjectLivePreview'],
		NullProperties<TunnelInstanceProxyPreviewProperties>
  >;

/**
	Information about the active tunnel instance (might be null if the user has not associated it with a tunnel instance)
*/
export function createProjectLivePreviewProperties<
	$Args extends NarrowLocalProxyContextArgs,
>(
	_args: CreateLocalProxyContextArgs,
): ContextTunnelInstanceProxyPreviewProperties<$Args> {
	return defineProperties<ContextTunnelInstanceProxyPreviewProperties>({
		userLocalWorkspaceId: null,
		projectLivePreviewId: null,
		tunnelInstanceProxyPreviewId: null,
	});
}
