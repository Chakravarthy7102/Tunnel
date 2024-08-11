import type {
	AnyCollections,
	ClientDoc,
	ClientFlatDoc,
	ClientGenericBaseDoc,
} from '#types';
import type {
	Doc,
	DocExtras,
	EmptySelection,
	Id,
	InferRelationTableName,
	Selection,
	SelectOutput,
	TableNames,
} from '@-/database';
import * as tables from '@-/database/tables';
import type { IsVirtualArray } from 'corvex';
import extend from 'just-extend';
import mapObject from 'map-obj';
import deepmerge from 'plaindeepmerge';

type SelectionInclude<$Value> = $Value extends true ? {} : $Value;

// dprint-ignore
type CreateInput<$Selection extends Selection> =
	// CIDs should be strings
	ClientGenericBaseDoc<$Selection['tableName']> &
	{
		[
			$Key in keyof Pick<
				DocExtras<$Selection['tableName']>,
				keyof $Selection['include']
			>
		]-?:
			InferRelationTableName<Doc<$Selection['tableName']>[$Key]> extends TableNames ?
				IsVirtualArray<Doc<$Selection['tableName']>[$Key]> extends true ?
					{
						_id: Id<
							InferRelationTableName<Doc<$Selection['tableName']>[$Key]>
						>
					}[] |
					CreateInput<
						Selection<
							InferRelationTableName<Doc<$Selection['tableName']>[$Key]>,
							SelectionInclude<$Selection['include'][$Key]['include']>
						>
					>[] :
				{
					_id: Id<
						InferRelationTableName<Doc<$Selection['tableName']>[$Key]>
					>
				} |
				CreateInput<
					Selection<
						InferRelationTableName<Doc<$Selection['tableName']>[$Key]>,
						SelectionInclude<$Selection['include'][$Key]['include']>
					>
				> |
				(null extends Doc<$Selection['tableName']>[$Key] ? null : never) :
			// Excluded property
			Doc<$Selection['tableName']>[$Key]
	};

// dprint-ignore
// @ts-expect-error: todo
export const createDoc: {
	/**
		Returns a doc directly based on the selection that was passed to it
	*/
	<$TableName extends TableNames, $Include>(
		tableName: $TableName,
		doc: SelectOutput<$TableName, $Include>,
	): ClientDoc<Selection<$TableName, $Include>>;
	action<$Selection extends Selection>(
		tableName: $Selection['tableName'],
		createCallback: (
			create: <$ExplicitSelection extends Selection>(
				input: CreateInput<$ExplicitSelection>,
			) => $ExplicitSelection
		) => $Selection,
	): {
		<$State extends { $collections: AnyCollections }>(state: $State): $State;
		_id: Id<$Selection['tableName']>;
		flatDoc: ClientFlatDoc<$Selection>;
		input: unknown;
	};
	action<$TableName extends TableNames>(
		tableName: $TableName,
		createCallback: (
			create: (
				input: CreateInput<EmptySelection<$TableName>>,
			) => unknown,
		) => unknown,
	): {
		<$State extends { $collections: AnyCollections }>(state: $State): $State;
		_id: Id<$TableName>;
		input: unknown;
	};
} = Object.assign((tableName: string, doc: any) => {
	return doc;
}, {
	action(
		tableName: TableNames,
		createCallback: (create: (input: any) => any) => any,
	) {
		let input!: any;
		const doc = createCallback((inp) => {
			input = inp
			return input;
		});

		const flatDoc = flattenDoc(tableName, doc)
		return Object.assign(
			(state: any) => ({
				...state,
				$collections: deepmerge(
					state.$collections,
					docCollections(tableName, doc)
				)
			}),
			{ _id: flatDoc._id, flatDoc, input },
		)
	},
});

function flattenDoc(tableName: TableNames, document: Record<string, unknown>) {
	return mapObject(document, (key, value: any) => {
		const fieldConfiguration = tables[tableName].configuration[key];

		if (
			value === null ||
			value === undefined ||
			fieldConfiguration === undefined ||
			!('foreignTable' in fieldConfiguration)
		) {
			return [key, value];
		}

		return [
			key,
			// dprint-ignore
			typeof value === 'string' ?
				{ _id: value } :
			value.constructor === Array ?
				value.map((value) => typeof value === 'string' ? { _id: value } : { _id: value._id }) :
			{ _id: value._id },
		];
	});
}

function docCollections(
	tableName: TableNames,
	doc: { id: string } & Record<string, any>,
): AnyCollections {
	const table = tables[tableName];
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- Better error message for unexpected runtime failures
	if (table === undefined) {
		throw new Error(`Could not find table "${String(tableName)}"`);
	}

	const $collections: any = {};
	$collections[tableName] ??= {};
	$collections[tableName][doc._id] ??= {
		__tableName: tableName,
	};

	for (const [key, value] of Object.entries(doc)) {
		const configuration = table.configuration[key];
		if (configuration !== undefined && 'foreignTable' in configuration) {
			const foreignTableName = configuration.foreignTable as TableNames;

			if (value === null) {
				$collections[tableName][doc._id][key] = null;
			} // Possibly an array of documents
			else if (value.constructor === Array) {
				$collections[tableName][doc._id][key] = value
					.map((value) => {
						if (value === null) {
							return null;
						}

						let valueId: string;
						if (value._id === undefined) {
							if (typeof value === 'string') {
								valueId = value;
							} else {
								return undefined;
							}
						} else {
							valueId = value._id;
							extend(
								true,
								$collections,
								docCollections(foreignTableName, value),
							);
						}

						return { _id: valueId };
					})
					.filter((v) => v !== undefined);
			} else {
				let valueId: string;
				if (value._id === undefined) {
					// Not part of the selection
					continue;
				} else {
					valueId = value._id;
					extend(
						true,
						$collections,
						docCollections(foreignTableName, value),
					);
				}

				$collections[tableName][doc._id][key] = { _id: valueId };
			}
		} // This field is not a relation
		else {
			$collections[tableName][doc._id][key] = value;
		}
	}

	return $collections;
}

// dprint-ignore
// @ts-expect-error: todo
export const createManyDoc: {
	/**
		Returns a doc directly based on the selection that was passed to it
	*/
	<$TableName extends TableNames, $Include>(
		tableName: $TableName,
		docs: SelectOutput<$TableName, $Include>[],
	): ClientDoc<Selection<$TableName, $Include>>;
	action<$Selection extends Selection>(
		tableName: $Selection['tableName'],
		createCallback: (
			create: <$ExplicitSelection extends Selection>(
				input: CreateInput<$ExplicitSelection>[],
			) => $ExplicitSelection
		) => $Selection,
	): {
		<$State extends { $collections: AnyCollections }>(state: $State): $State;
		_ids: Id<$Selection['tableName']>[];
		flatDocs: ClientFlatDoc<$Selection>[];
		input: unknown;
	};
	action<$TableName extends TableNames>(
		tableName: $TableName,
		createCallback: (
			create: (
				input: CreateInput<EmptySelection<$TableName>>[],
			) => unknown,
		) => unknown,
	): {
		<$State extends { $collections: AnyCollections }>(state: $State): $State;
		_ids: Id<$TableName>[];
		input: unknown;
	};
} = Object.assign((tableName: string, docs: any) => {
	return docs;
}, {
	action(
		tableName: TableNames,
		createCallback: (create: (input: any) => any) => any,
	) {
		let input!: any;
		const docs: any[] = createCallback((inp) => {
			input = inp
			return input;
		});

		const flatDocs = docs.map(doc => flattenDoc(tableName, doc))
		return Object.assign(
			(state: any) => ({
				...state,
				$collections: deepmerge(
					state.$collections,
					// @ts-expect-error: works at runtime
					...docs.map(doc => docCollections(tableName, doc))
				)
			}),
			{ _ids: flatDocs.map(flatDoc => flatDoc._id), flatDocs, input },
		)
	},
});
