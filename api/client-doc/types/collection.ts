import type { TableNames } from '@-/database';
import type { ClientPartialDoc } from './doc.ts';

/**
	We use namespaced $collections instead of a flat $documents object because the CID might be the same across two separate collections (e.g. when a table is renamed).
*/
export type AnyCollections = {
	[$TableName in TableNames]: Record<
		string,
		| ClientPartialDoc<$TableName>
		// A value of `null` means that the doc has been deleted; we use `null` instead of deleting it from the object to distinguish between a value that hasn't ever existed vs a value that has been deleted
		| null
	>;
};
