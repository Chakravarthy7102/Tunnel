import type {
	CreatePageToolbarContextArgs,
	NarrowPageToolbarContextArgs,
} from '#types';
import { getHostnameType } from '@-/host-environment';
import { defineProperties } from '@tunnel/context';

interface ContextHostnameProperties<
	$Args extends NarrowPageToolbarContextArgs = NarrowPageToolbarContextArgs,
> {
	hostnameType: $Args['hostnameType'];
}

export function createHostnameProperties<
	$Args extends NarrowPageToolbarContextArgs,
>(_args: CreatePageToolbarContextArgs): ContextHostnameProperties<$Args> {
	return defineProperties<ContextHostnameProperties>({
		hostnameType: getHostnameType(window.location),
	});
}
