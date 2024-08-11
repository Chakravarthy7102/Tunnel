import type {
	Doc,
	DocBase,
	DocExtras,
	Id,
	InferRelationTableName,
	IsRelation,
	Selection,
	TableNames,
} from '@-/database';
import type { IsVirtualArray } from 'corvex';

export interface AnyClientDoc {
	_id: string;
	__tableName: TableNames;
}

// dprint-ignore
/**
	A client document that contains all non-excluded and non-relation properties.
*/
export type ClientGenericBaseDoc<$TableName extends TableNames> =
	{ [$Key in keyof DocBase<$TableName>]: DocBase<$TableName>[$Key] }

export type ClientBaseDoc<$TableName extends TableNames> = ClientGenericBaseDoc<
	$TableName
>;

// dprint-ignore
type FlatValue<$Value> =
	IsRelation<$Value> extends true ?
		IsVirtualArray<$Value> extends true ?
			// @ts-expect-error: works
			{ _id: Id<InferRelationTableName<$Value>> }[] :
		// @ts-expect-error: works
		{ _id: Id<InferRelationTableName<$Value>> } |
		(null extends $Value ? null : never) :
	// Excluded properties
	$Value;

// dprint-ignore
type SuperFlatValue<$Value> =
	IsRelation<$Value> extends true ?
		IsVirtualArray<$Value> extends true ?
			string[] :
		string |
		(null extends $Value ? null : never) :
	// Excluded properties
	$Value;

// dprint-ignore
/**
	A client document with all excluded and relational properties set to partial instead of omitted.
*/
export type ClientPartialDoc<$TableName extends TableNames> =
	ClientBaseDoc<$TableName> &
	{ [$Key in keyof DocExtras<$TableName>]?: FlatValue<DocExtras<$TableName>[$Key]> };

// dprint-ignore
export type ClientFlatDocWithInclude<
	$TableName extends TableNames,
	$Include
> =
	ClientBaseDoc<$TableName> &
	{
		[
			$Key in keyof Pick<
				DocExtras<$TableName>,
				 // @ts-expect-error: works
				keyof $Include
			>
		]: FlatValue<
			// @ts-expect-error: `Pick` is guaranteed to return a subset
			DocExtras<$TableName>[$Key]
		>
	};

// dprint-ignore
export type ClientSuperFlatDocWithInclude<
	$TableName extends TableNames,
	$Include
> =
	ClientBaseDoc<$TableName> &
	{
		[
			$Key in keyof Pick<
				DocExtras<$TableName>,
				 // @ts-expect-error: works
				keyof $Include
			>
		]-?: SuperFlatValue<
			// @ts-expect-error: `Pick` is guaranteed to return a subset
			DocExtras<$TableName>[$Key]
		>
	};

// dprint-ignore
/**
	Relations in the selection are CIDs instead of nested objects.
*/
export type ClientFlatDoc<
	$SelectionOrTableName extends Selection | TableNames,
> =
	$SelectionOrTableName extends TableNames ?
		ClientDocWithInclude<$SelectionOrTableName, {}> :
	$SelectionOrTableName extends Selection ?
		ClientFlatDocWithInclude<
			$SelectionOrTableName['tableName'],
			$SelectionOrTableName['include']
		> :
	never;

// dprint-ignore
export type ClientDoc<
	$SelectionOrTableName extends Selection | TableNames,
> =
	$SelectionOrTableName extends TableNames ?
		ClientDocWithInclude<$SelectionOrTableName, {}> :
	$SelectionOrTableName extends Selection ?
		ClientDocWithInclude<
			$SelectionOrTableName['tableName'],
			$SelectionOrTableName['include']
		> :
	never;

// dprint-ignore
type NormalizeInclude<$SelectionValue> =
	$SelectionValue extends { include: any } ?
		$SelectionValue['include'] :
	{};

// dprint-ignore
/**
	A client document is a flat object that is used on the client, where any `Id` fields are replaced with a CID (string)
*/
export type ClientDocWithInclude<
	$TableName extends TableNames,
	$Include
> =
	ClientBaseDoc<$TableName> &
	{
		[
			$Key in keyof Pick<
				DocExtras<$TableName>,
				// @ts-expect-error: works
				keyof $Include
			>
		]-?:
			$Key extends keyof Doc<$TableName> ?
				InferRelationTableName<Doc<$TableName>[$Key]> extends TableNames ?
					IsVirtualArray<Doc<$TableName>[$Key]> extends true ?
						ClientDocWithInclude<
							InferRelationTableName<Doc<$TableName>[$Key]>,
							NormalizeInclude<$Include[$Key]>
						>[] :
					ClientDocWithInclude<
						InferRelationTableName<Doc<$TableName>[$Key]>,
						NormalizeInclude<$Include[$Key]>
					> |
					(null extends Doc<$TableName>[$Key] ? null : never) :
				// Not a relation (i.e. an excluded property)
				Doc<$TableName>[$Key] :
			never
	}
