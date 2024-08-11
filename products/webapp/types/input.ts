/**
	The actor metaschema is used to refer to the authenticated entity specified in a tRPC input schema.
*/
export interface ActorMetaschema {
	actorProperty: string;
	input: unknown;
}
