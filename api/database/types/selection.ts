import type { ServerDoc, TableNames } from '#types';
import type { EmptyObject } from 'type-fest';

export interface Selection<
	$TableName extends TableNames = any,
	$Include = any,
> {
	tableName: $TableName;
	include: $Include;
}

export interface EmptySelection<$TableName extends TableNames = any>
	extends Selection<$TableName, {}>
{}

export type GetInclude<$Selection extends Selection> = $Selection['include'];

export type SelectionInput = Selection | EmptyObject;
export type SelectionOutput<
	$TableName extends TableNames,
	$Input extends SelectionInput,
> = $Input extends EmptyObject ? ServerDoc<$TableName> :
	$Input extends Selection<any, any> ? ServerDoc<$Input> :
	never;
