import * as tables from '#tables/_.tables.ts';
import {
	defineSchema,
	defineTable,
	type TableDefinition,
} from '@-/convex/server';
import type { ExtractDocument, ExtractFieldPaths, Table } from 'corvex';
import mapObject from 'map-obj';

export default defineSchema(
	mapObject(tables, (key, { schema, setTableIndexes }) => [
		key,
		setTableIndexes(defineTable(schema)),
	]) as {
		[$Key in keyof typeof tables]: (typeof tables)[$Key] extends Table<
			string,
			infer $DocumentSchema,
			infer $TableIndexes,
			infer $SearchIndexes,
			infer $VectorIndexes
		> ? TableDefinition<
				ExtractDocument<$DocumentSchema>,
				ExtractFieldPaths<$DocumentSchema>,
				$TableIndexes,
				$SearchIndexes,
				$VectorIndexes
			> :
			never;
	},
);
