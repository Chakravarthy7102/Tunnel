import type { NarrowPageToolbarContextArgs } from '#types';
import { defineProperties, type IfExtends } from '@tunnel/context';

interface OnlineProperties {
	isOnline: true;
}

interface OfflineProperties {
	isOnline: false;
}

// dprint-ignore
type ContextOnlineProperties<
	$Args extends NarrowPageToolbarContextArgs = NarrowPageToolbarContextArgs
> =
	IfExtends<true, $Args['isOnline'], OnlineProperties> |
	IfExtends<false, $Args['isOnline'], OfflineProperties>;

export function createOnlineProperties<
	$Args extends NarrowPageToolbarContextArgs,
>(): ContextOnlineProperties<$Args> {
	return defineProperties<ContextOnlineProperties>({
		isOnline: true,
	});
}
