import type {
	CreatePageToolbarContextArgs,
	NarrowPageToolbarContextArgs,
} from '#types';
import type { Actor } from '@-/actor';
import type { Id } from '@-/database';

import { defineProperties, type IfExtends } from '@tunnel/context';

interface ContextActorProperties<
	$Args extends NarrowPageToolbarContextArgs = NarrowPageToolbarContextArgs,
> {
	/**
		The type of the actor visiting the tunnel URL (anonymous user = not logged in)
	*/
	actor:
		| {
			[$ActorType in NonNullable<$Args['actorType']>]: Actor<$ActorType>;
		}[NonNullable<$Args['actorType']>]
		| IfExtends<null, $Args['actorType'], null>;
	actorOrganizationMemberId:
		| Id<'OrganizationMember'>
		| null;
}

export function createActorProperties<
	$Args extends NarrowPageToolbarContextArgs,
>(_args: CreatePageToolbarContextArgs): ContextActorProperties<$Args> {
	return defineProperties<ContextActorProperties>({
		actor: null,
		actorOrganizationMemberId: null,
	});
}
