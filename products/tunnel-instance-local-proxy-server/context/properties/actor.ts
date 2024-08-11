import type {
	CreateLocalProxyContextArgs,
	NarrowLocalProxyContextArgs,
} from '#types';
import type { Actor } from '@-/actor';
import { defineProperties, type IfExtends } from '@tunnel/context';

// dprint-ignore
type ContextActorProperties<
	$Args extends NarrowLocalProxyContextArgs = NarrowLocalProxyContextArgs
> =
	IfExtends<
		null,
		$Args['actorType'],
		{ actor: null }
	> |
	IfExtends<
		'User',
		$Args['actorType'],
		{ actor: Actor<'User'> }
	>

export function createActorProperties<
	$Args extends NarrowLocalProxyContextArgs,
>({ actor }: CreateLocalProxyContextArgs): ContextActorProperties<$Args> {
	return defineProperties<ContextActorProperties>({
		actor: actor as any,
	});
}
