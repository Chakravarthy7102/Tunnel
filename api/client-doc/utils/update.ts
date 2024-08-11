import type {
	AnyCollections,
	ClientFlatDoc,
} from '#types';
import type { Id, TableNames } from '@-/database';
import mapObject from 'map-obj';

export const updateDoc = {
	action<
		$TableName extends TableNames,
		$Id extends Id<$TableName>,
	>(
		tableName: $TableName,
		id: $Id,
		set: (
			doc: ClientFlatDoc<$TableName>,
		) => ClientFlatDoc<$TableName>,
	): <$State extends { $collections: AnyCollections }>(
		state: $State,
	) => $State {
		return (state) => ({
			...state,
			$collections: {
				...state.$collections,
				[tableName]: mapObject(
					state.$collections[tableName],
					// @ts-expect-error: broken
					(key, doc: any) => {
						if (doc._id === id) {
							return [key, set(doc)];
						}

						return [key, doc];
					},
				),
			},
		});
	},
};
