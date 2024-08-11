import type { TableNames } from '#convex/_generated/dataModel.js';
import * as tables from '#tables/_.tables.ts';
import type { QueryCtx } from '#types';
import { type GenericId } from '@-/convex/values';
import mapObject, { mapObjectSkip } from 'map-obj';

/**
	Removes deprecated and relation fields from the document
*/
function filterDocument(tableName: string, document: any) {
	if (!(tableName in tables)) {
		throw new Error(`Cannot find table ${tableName}`);
	}

	const table = tables[tableName as keyof typeof tables];

	// We make sure that the document contains all non-relation fields
	const filteredDocument = mapObject(
		// @ts-expect-error: Accessing a private property of the `Validator` class
		table.schema.json.value,
		// @ts-expect-error: Bad `mapObject` types
		(field: string, fieldValidator) => {
			// Don't include deprecated fields
			if (fieldValidator.fieldType?.__deprecated) {
				return mapObjectSkip;
			}

			const fieldConfiguration = table.configuration[field];
			// We skip relation fields
			if (
				fieldConfiguration !== undefined &&
				'foreignTable' in fieldConfiguration
			) {
				return mapObjectSkip;
			}

			const documentValue = document[field];

			if (
				fieldConfiguration !== undefined && 'transform' in fieldConfiguration &&
				'isDeprecated' in fieldConfiguration
			) {
				if ((fieldConfiguration as any).isDeprecated(document)) {
					// The document needs to be transformed from the old shape to the new shape
					return [field, (fieldConfiguration.transform as any)(document)];
				} else {
					return [field, documentValue];
				}
			}

			if (documentValue !== undefined) {
				return [field, documentValue];
			} else {
				// If the value is undefined, we use the default value
				const getDefault = fieldConfiguration?.default;
				if (getDefault === undefined) {
					throw new Error(
						`Missing default value for field ${tableName}.${field}`,
					);
				}

				return [field, getDefault(document)];
			}
		},
	);
	filteredDocument._id = document._id;
	filteredDocument._creationTime = document._creationTime;

	return filteredDocument;
}

export async function applyPolyInclude<
	$TableName extends readonly TableNames[],
	// dprint-ignore
	$IdOrIds extends
		{ _id: GenericId<$TableName[number]>, __tableName: $TableName[number] } |
		{ _id: GenericId<$TableName[number]>, __tableName: $TableName[number] }[] |
		null,
>(
	ctx: QueryCtx,
	idOrIds: $IdOrIds,
	selections: Record<$TableName[number], any>,
): // dprint-ignore
Promise<
	$IdOrIds extends Array<any> ?
		Array<Record<string, unknown>> :
	Record<string, unknown> |
	(null extends $IdOrIds ? null : never)
> {
	if (idOrIds === null) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- Hopefully not null
		return null!;
	}

	const ids: {
		_id: GenericId<$TableName[number]>;
		__tableName: $TableName[number];
	}[] = Array.isArray(idOrIds) ? idOrIds : [idOrIds];

	const documents = await Promise.all(
		ids.map(async ({ _id, __tableName }) =>
			applyInclude(
				ctx,
				__tableName,
				await ctx.db.get(_id),
				selections[__tableName],
			)
		),
	);

	// @ts-expect-error: todo
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- Guaranteed to exist
	return Array.isArray(idOrIds) ? documents : documents[0]!;
}

export async function applyInclude<
	$TableName extends TableNames,
	// dprint-ignore
	$IdOrIds extends
		GenericId<$TableName> |
		GenericId<$TableName>[] |
		{ _id: GenericId<$TableName> } |
		{ _id: GenericId<$TableName> }[] |
		null,
>(
	ctx: QueryCtx,
	tableName: $TableName,
	idOrIds: $IdOrIds,
	selection: any,
): // dprint-ignore
Promise<
	$IdOrIds extends Array<any> ?
		Array<Record<string, unknown>> :
	Record<string, unknown> |
	(null extends $IdOrIds ? null : never)
> {
	if (idOrIds === null) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- Hopefully not null
		return null!;
	}

	const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds];

	const applyIncludeToDocument = async (
		tableName: string,
		documentOrDocuments:
			| null
			| Record<string, any>
			| (Record<string, any> | null)[],
		selectionObject: Record<
			string,
			'cid' | 'ref' | true | { include: Record<string, any> }
		>,
	) => {
		if (!tableName) {
			throw new Error('Missing table name');
		}

		const table = tables[tableName as keyof typeof tables];

		const documents = Array.isArray(documentOrDocuments) ?
			documentOrDocuments :
			[documentOrDocuments];

		const selectedDocuments = await Promise.all(
			documents.map(async (document) => {
				if (document === null) {
					return null;
				}

				const selectedDocument = filterDocument(tableName, document);

				await Promise.all(
					Object.entries(selectionObject).map(
						// eslint-disable-next-line complexity -- todo
						async ([selectionKey, selectionValue]) => {
							const configuration = table.configuration[selectionKey];
							if (configuration === undefined) {
								// Must be an excluded property, so we add it to the document as-is
								selectedDocument[selectionKey] = document[selectionKey];
								return;
							}

							// If the "type" property is present, it means the relation is virtual (i.e. not an ID)
							if ('type' in configuration) {
								if (
									// @ts-expect-error: Accessing a private property of the `Validator` class
									table.schema.json.value[selectionKey] === undefined
								) {
									throw new Error(
										`Field not found: ${tableName}.${selectionKey}`,
									);
								}

								let subdocuments: any;
								try {
									subdocuments = await ctx.db
										.query(configuration.foreignTable as any)
										.withIndex(
											configuration.foreignIndex as any,
											(q: any) =>
												q.eq(
													configuration.foreignIndex.replace('by_', ''),
													document._id,
												),
										)
										[
											configuration.type === 'virtualArray' ?
												'collect' :
												'first'
										]();
								} catch (error) {
									// We use a try/catch in case the index has been deleted in a staging deployment and causes `withIndex` to throw
									console.warn(error);
									subdocuments = configuration.type === 'virtualArray' ?
										[] :
										null;
								}

								if (subdocuments === null) {
									selectedDocument[selectionKey] = null;
								} else {
									// dprint-ignore
									selectedDocument[selectionKey] =
										typeof selectionValue === 'object' && 'include' in selectionValue ?
											await applyIncludeToDocument(
												configuration.foreignTable,
												subdocuments,
												selectionValue.include,
											) :
										selectionValue === 'cid' ?
											Array.isArray(subdocuments) ? subdocuments.map(subdoc => ({ id: subdoc._id })) : { id: subdocuments._id } :
										selectionValue === 'ref' ?
											Array.isArray(subdocuments) ? subdocuments.map(subdoc => ({ id: subdoc._id, _id: subdoc._id })) : {
												 id: subdocuments._id, _id: subdocuments._id
											} :
										subdocuments;
								}
							} else if ('foreignTable' in configuration) {
								// The relation is an ID

								if (document[selectionKey] === null) {
									selectedDocument[selectionKey] = null;
									return;
								}

								// The ID might be `undefined` for new/deprecated fields
								if (document[selectionKey] === undefined) {
									if ('default' in configuration) {
										// @ts-expect-error: todo broken type
										selectedDocument[selectionKey] = configuration.default(
											document,
										);
									} else {
										selectedDocument[selectionKey] = undefined;
									}

									return;
								}

								const subdocument = await ctx.db.get(document[selectionKey]);

								if (subdocument === null) {
									selectedDocument[selectionKey] = null;
								} else {
									// dprint-ignore
									selectedDocument[selectionKey] =
									typeof selectionValue === 'object' && 'include' in selectionValue ?
										await applyIncludeToDocument(
											configuration.foreignTable,
											subdocument,
											selectionValue.include,
										) :
									selectionValue === 'cid' ?
										{ id: subdocument._id } :
									selectionValue === 'ref' ?
										{ id: subdocument._id, _id: subdocument._id } :
									subdocument;
								}
								// TODO: fix types so this works better
								// filterDocument(configuration.foreignTable, subdocument);
							}
						},
					),
				);

				return selectedDocument;
			}),
		);

		return Array.isArray(documentOrDocuments) ?
			selectedDocuments :
			selectedDocuments[0];
	};

	const documents = await Promise.all(
		(ids as any).map(async (id: any) =>
			applyIncludeToDocument(
				tableName,
				await ctx.db.get(typeof id === 'string' ? id : id._id),
				selection,
			)
		),
	);

	return Array.isArray(idOrIds) ? documents : documents[0];
}
