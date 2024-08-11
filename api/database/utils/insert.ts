import type {
	CurrentDoc,
	DataModel,
	Doc,
	Id,
	MutationCtxWithoutDelete,
	TableNames,
} from '#types';
import type { Exact } from 'corvex';

export async function dbInsert<
	$TableName extends TableNames,
	$Data extends Exact<
		Omit<CurrentDoc<$TableName>, '_creationTime' | '_id'>,
		$Data
	>,
>(
	ctx: MutationCtxWithoutDelete,
	tableName: $TableName,
	data: $Data,
	options: {
		unique: {
			[
				$IndexName in Exclude<
					keyof DataModel[$TableName]['indexes'],
					'by_creation_time'
				>
			]?: Array<keyof Doc<$TableName>>;
		};
	},
): Promise<Id<$TableName>> {
	const unique = { ...options.unique };

	await Promise.all(
		Object.entries(unique).map(async ([indexName, fields]) => {
			const existingDocument = await ctx.db
				.query(tableName)
				.withIndex(indexName, (q: any) => {
					for (const field of fields ?? []) {
						// @ts-expect-error: works
						q = q.eq(field, data[field]);
					}

					return q;
				})
				.first();

			if (existingDocument !== null) {
				throw new Error(
					`A ${tableName} with unique constraint ${
						(fields ?? [])
							.map((field) => [field, existingDocument[field]].join(' = '))
							.join(',')
					} already exists`,
				);
			}
		}),
	);

	return ctx.db.insert(tableName, data as any);
}
