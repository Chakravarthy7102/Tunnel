import * as tables from '#tables/_.tables.ts';
import type { SelectInput, TableNames } from '#types';
import mapObject from 'map-obj';
import onetime from 'onetime';
import deepmerge from 'plaindeepmerge';
import type { Exact } from 'type-fest';

export const getIncludes = onetime(() => {
	return Object.assign(
		// @ts-expect-error: todo
		((...args: any[]) => deepmerge(...args)) as typeof deepmerge,
		mapObject(
			tables,
			(tableName) => [
				tableName,
				(input: any) => input,
			],
		) as {
			[$TableName in TableNames]: <
				const $Input extends Exact<SelectInput<$TableName>, $Input>,
			>(
				input: $Input,
			) => $Input;
		},
	);
});
