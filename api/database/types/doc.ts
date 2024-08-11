import type { Doc, Id, TableNames } from '#convex/_generated/dataModel.js';
import type {
	IsDeprecated,
	IsExcluded,
	IsNew,
	IsRelation,
	PickCurrent,
	PickDeprecated,
} from 'corvex';
import type { SelectOutput } from './select.ts';
import type { Selection } from './selection.ts';

// dprint-ignore
/**
	All non-relation and non-excluded fields.
*/
export type DocBase<$TableName extends TableNames> =
	{ _id: Id<$TableName> } &
	{
		[
			$Key in keyof CurrentDoc<$TableName> as
				IsRelation<CurrentDoc<$TableName>[$Key]> extends true ?
					never :
				IsExcluded<CurrentDoc<$TableName>[$Key]> extends true ?
					never :
				$Key
		]: CurrentDoc<$TableName>[$Key]
	};

// dprint-ignore
/**
	All relational and excluded fields
*/
export type DocExtras<$TableName extends TableNames> = {
	[
		$Key in keyof Omit<CurrentDoc<$TableName>, '_id'> as
			// eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error -- ignore too complex union
			// @ts-ignore: ignore too complex union
			IsRelation<CurrentDoc<$TableName>[$Key]> extends true ?
				$Key :
			IsExcluded<CurrentDoc<$TableName>[$Key]> extends true ?
				$Key :
			never
	]: CurrentDoc<$TableName>[$Key]
}

// dprint-ignore
/**
	A `CurrentDoc` is a wrapper around a convex `Doc` that excludes all deprecated fields and makes all new fields required.
*/
export type CurrentDoc<$TableName extends TableNames> = PickCurrent<Doc<$TableName>>;

// dprint-ignore
/**
	A `DeprecatedDoc` is a wrapper around a convex `Doc` that includes all deprecated fields and omits all new fields required.
*/
export type DeprecatedDoc<$TableName extends TableNames> = PickDeprecated<Doc<$TableName>>;

// dprint-ignore
export type DocNewProperties<$TableName extends TableNames> =
	{
		[
			K in keyof Doc<$TableName> as
				IsNew<NonNullable<Doc<$TableName>>[K]> extends true ?
					K :
				never
		]-?: Exclude<Doc<$TableName>[K], undefined>
	};

// dprint-ignore
export type DocDeprecatedProperties<$TableName extends TableNames> =
	{
		[
			K in keyof Doc<$TableName> as
				IsDeprecated<NonNullable<Doc<$TableName>>[K]> extends true ?
					K :
				never
		]-?: Exclude<Doc<$TableName>[K], undefined>
	};

// dprint-ignore
export type ServerDoc<
	$SelectionOrTableName extends Selection | TableNames,
> =
	$SelectionOrTableName extends TableNames ?
		SelectOutput<
			$SelectionOrTableName,
			{}
		> :
	$SelectionOrTableName extends Selection ?
		SelectOutput<
			$SelectionOrTableName['tableName'],
			$SelectionOrTableName['include']
		> :
	never;
