import type {
	CreatePageToolbarContextArgs,
	NarrowPageToolbarContextArgs,
} from '#types';
import type { Id } from '@-/database';
import {
	defineProperties,
	type IfExtends,
	type NullProperties,
} from '@tunnel/context';

interface TunnelInstanceProperties {
	tunnelInstanceProxyPreviewId: Id<'TunnelInstanceProxyPreview'>;
	settings: { [key: string]: string };
}

// dprint-ignore
type ContextTunnelInstanceProperties<
	$Args extends NarrowPageToolbarContextArgs = NarrowPageToolbarContextArgs
> =
	IfExtends<true, $Args['hasTunnelInstanceProxyPreview'], TunnelInstanceProperties> |
	IfExtends<
		false,
		$Args['hasTunnelInstanceProxyPreview'],
		Omit<NullProperties<TunnelInstanceProperties>, 'settings'> & {
			settings: Record<string, string>;
		}
	>;

export function createTunnelInstanceProperties<
	$Args extends NarrowPageToolbarContextArgs,
>(_args: CreatePageToolbarContextArgs): ContextTunnelInstanceProperties<$Args> {
	return defineProperties<ContextTunnelInstanceProperties>({
		tunnelInstanceProxyPreviewId: null,
		settings: {},
	});
}
