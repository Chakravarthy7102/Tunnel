import type {
	CurrentDoc,
	Doc,
	DocBase,
	DocExtras,
	TableNames,
} from '#types';
import type { GenericId } from '@-/convex/values';
import type {
	IsExcluded,
	IsVirtual,
	IsVirtualArray,
	UnwrapLabeled,
} from 'corvex';

// dprint-ignore
export type SelectInput<$TableName extends TableNames> = {
	[
		$Key in keyof CurrentDoc<$TableName> as
			InferRelationTableName<CurrentDoc<$TableName>[$Key]> extends string ?
				$Key :
			IsExcluded<CurrentDoc<$TableName>[$Key]> extends true ?
				$Key :
			never
	]?:
		InferRelationTableName<CurrentDoc<$TableName>[$Key]> extends TableNames ?
			{ include: SelectInput<InferRelationTableName<CurrentDoc<$TableName>[$Key]>> } | true | 'cid' | 'ref' :
		IsExcluded<CurrentDoc<$TableName>[$Key]> extends true ?
			true :
		never
}

// dprint-ignore
type RelationIncludeOutput<$NestedTableName extends TableNames, $IncludeInput> =
	$IncludeInput extends { include: infer $NestedSelect } ?
		SelectOutput<$NestedTableName, $NestedSelect> :
	$IncludeInput extends true ?
		DocBase<$NestedTableName> :
	never;

// dprint-ignore
export type SelectOutput<
	$TableName extends TableNames,
	$Include
> =
	DocBase<$TableName> &
	{
		[
			$Field in keyof Pick<
				DocExtras<$TableName>,
				// @ts-expect-error: Guaranteed to be a key of `DocExtras`
				keyof $Include
			>]-?:
			// We use `Doc` instead of `DocExtras` during lookup for better performance
			$Field extends keyof Doc<$TableName> ?
				InferRelationTableName<Doc<$TableName>[$Field]> extends TableNames ?
					IsVirtualArray<Doc<$TableName>[$Field]> extends true ?
						RelationIncludeOutput<
							InferRelationTableName<Doc<$TableName>[$Field]>,
							$Include[$Field]
						>[] :
					RelationIncludeOutput<
						InferRelationTableName<Doc<$TableName>[$Field]>,
						$Include[$Field]
					> |
					(null extends Doc<$TableName>[$Field] ? null : never) :
				// Excluded field
				Doc<$TableName>[$Field] :
			never
	};

// dprint-ignore
export type IsRelation<$Value> =
	NonNullable<$Value> extends GenericId<string> ?
		true :
	IsVirtual<NonNullable<$Value>> extends true ?
		true :
	IsVirtualArray<NonNullable<$Value>> extends true ?
		true :
	false

// dprint-ignore
export type InferRelationTableName<$Value> =
	NonNullable<$Value> extends GenericId<infer $SelectedTableName> ?
		$SelectedTableName :
	IsVirtual<NonNullable<$Value>> extends true ?
		UnwrapLabeled<NonNullable<$Value>> :
	IsVirtualArray<NonNullable<$Value>> extends true ?
		UnwrapLabeled<NonNullable<$Value>> :
	unknown
