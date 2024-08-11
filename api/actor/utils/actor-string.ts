import type { Actor, ActorString, ActorType } from '#types';

export function getActorString<$Actor extends Actor>(
	actor: $Actor,
): $Actor extends Actor<infer $ActorType extends ActorType> ?
	ActorString<$ActorType> :
	never
{
	// @ts-expect-error: TypeScript isn't smart enough
	return `${actor.type}|${actor.data.id}`;
}

export function parseActorString<$ActorString extends string>(
	actorString: $ActorString,
): Actor;
export function parseActorString(actorString: string): Actor {
	const [actorType, actorDocumentId] = actorString.split('|');
	return {
		type: actorType,
		data: {
			id: actorDocumentId,
		},
	} as Actor;
}
