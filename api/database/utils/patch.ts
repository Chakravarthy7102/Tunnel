import type {
	DataModel,
	Doc,
	TableNames,
} from '#convex/_generated/dataModel.js';
import type { CurrentDoc, MutationCtx } from '#types';
import type { GenericId } from '@-/convex/values';

// eslint-disable-next-line max-params -- Necessary
export async function dbPatch<$TableName extends TableNames>(
	ctx: MutationCtx,
	tableName: $TableName,
	id: GenericId<$TableName>,
	updates: Partial<Omit<CurrentDoc<$TableName>, '_creationTime' | '_id'>>,
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
): Promise<void> {
	const unique = { ...options.unique, by_id: ['cid'] };

	await Promise.all(
		Object.entries(unique).map(async ([indexName, fields]) => {
			if (fields?.every((field) => (updates as any)[field] === undefined)) {
				return;
			}

			const existingDocument = await ctx.db
				.query(tableName)
				.withIndex(indexName, (q: any) => {
					for (const field of fields ?? []) {
						q = q.eq(field, updates[field]);
					}

					return q;
				})
				.first();

			if (existingDocument !== null && existingDocument._id !== id) {
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

	await ctx.db.patch(id, updates as any);
}
