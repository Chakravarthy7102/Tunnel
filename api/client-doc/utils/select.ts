import type {
	AnyCollections,
	ClientBaseDoc,
	ClientDocWithInclude,
} from '#types';
import type { Id, Selection, TableNames } from '@-/database';
import * as tables from '@-/database/tables';
import mapObject from 'map-obj';

// dprint-ignore
export function select<
	$TableName extends TableNames,
	$Id extends string | Id<$TableName> | null,
>(
	state: { $collections: AnyCollections },
	tableName: $TableName,
	id: $Id,
):
	'__tableName' extends keyof NonNullable<$Id> ?
		ClientBaseDoc<$TableName> |
		(null extends $Id ? null : never ) :
	ClientBaseDoc<$TableName> | null;
// dprint-ignore
export function select<
	$TableName extends TableNames,
	$Id extends string | Id<$TableName> | null,
	$Include
>(
	state: { $collections: AnyCollections },
	tableName: $TableName,
	id: $Id,
	include: $Include,
):
	$Include extends Selection<any, any> ?
		`The selection must be passed using \`getInclude(...)\`` :
	'__tableName' extends keyof NonNullable<$Id> ?
		ClientDocWithInclude<$TableName, $Include> |
		(null extends $Id ? null : never) :
	ClientDocWithInclude<$TableName, $Include> | null;
export function select(
	state: { $collections: AnyCollections },
	tableName: TableNames,
	id: string | null,
	include?: any,
): any {
	if (id === null) {
		return null;
	}

	// In the frontend, we only use `include` to determine which properties should have their CIDs expanded into the full document. We don't need to care about omitting excluded relations.
	const expandDocument = (
		tableName: TableNames,
		id: string,
		include: Record<string, any>,
	): any => {
		const document = state.$collections[tableName][id];
		if (document === undefined || document === null) {
			return null;
		}

		const { configuration } = tables[tableName];

		return mapObject(document, (field, value: any) => {
			const fieldConfiguration = configuration[field];

			if (
				value === undefined ||
				value === null ||
				include[field] === undefined ||
				fieldConfiguration === undefined ||
				!('foreignTable' in fieldConfiguration)
			) {
				return [field, value];
			}

			const { foreignTable } = fieldConfiguration;

			if (value.constructor === Array) {
				return [
					field,
					// dprint-ignore
					value.map((value: { _id: string }) =>
						include[field] === true ?
							state.$collections[foreignTable as TableNames][value._id] :
						typeof include[field] === 'object' && include[field].include !== undefined ?
							expandDocument(
								foreignTable as TableNames,
								value._id,
								include[field].include,
							) :
						value
					),
				];
			} else {
				// dprint-ignore
				return [
					field,
					include[field] === true ?
						state.$collections[foreignTable as TableNames][value._id] :
					typeof include[field] === 'object' && include[field].include !== undefined ?
						expandDocument(
							foreignTable as TableNames,
							value._id,
							include[field].include,
						) :
					value,
				];
			}
		});
	};

	return expandDocument(tableName, id, include ?? {});
}
