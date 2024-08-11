import type { ActorType } from '#types';

export type ActorString<$ActorType extends ActorType> =
	`${$ActorType}|${string}`;
