/* eslint-disable no-await-in-loop -- todo */

import type { DataModel, TableNames } from '#convex/_generated/dataModel.js';
import type { MutationCtx } from '#types';
import type { GenericId } from '@-/convex/values';
import { table } from 'corvex';

export async function dbDelete(
	ctx: MutationCtx,
	deletedTableName: keyof DataModel,
	id: GenericId<TableNames>,
) {
	// @ts-expect-error: Custom property
	const onDelete = table.onDelete?.get(deletedTableName);

	if (onDelete !== undefined) {
		for (
			const [
				affectedTableName,
				{ action, affectedFieldIndex, affectedField },
			] of Object.entries(onDelete) as any
		) {
			// Get all documents that have a reference to the deleted table
			const affectedDocuments = await ctx.db
				.query(affectedTableName as TableNames)
				.withIndex(
					affectedFieldIndex,
					(q: any) => q.eq(affectedFieldIndex.split('_').at(-1), id),
				)
				.collect();

			switch (action) {
				case 'SetNull': {
					await Promise.all(
						affectedDocuments.map(async (affectedDocument: any) => {
							await ctx.db.patch(affectedDocument._id, {
								[affectedField]: null,
							});
						}),
					);
					break;
				}

				case 'Cascade': {
					await Promise.all(
						affectedDocuments.map(async (affectedDocument: any) => {
							await dbDelete(ctx, affectedTableName, affectedDocument._id);
						}),
					);
					break;
				}

				case 'Restrict': {
					if (affectedDocuments.length > 0) {
						throw new Error(
							`Cannot delete "${deletedTableName}" with id ${id} because it is referenced by "${affectedTableName}"`,
						);
					}

					break;
				}

				default: {
					throw new Error(
						`Unknown onDelete action "${action}" for table "${deletedTableName}"`,
					);
				}
			}
		}
	}

	await ctx.db.delete(id);
}
