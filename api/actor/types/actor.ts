import type { Id } from '@-/database';

export type ActorType = 'User';

export interface Actor<_$ActorTypes = any> {
	type: 'User';
	data: { id: Id<'User'> };
}

export type ActorRefData<$ActorTypes extends ActorType = ActorType> = {
	[$ActorType in $ActorTypes]: {
		type: $ActorType;
		id: Id<$ActorType>;
	};
}[$ActorTypes];

export interface ActorData<$ActorTypes extends ActorType> {
	actor: Actor<$ActorTypes>;
	accessToken: string;
}
