import type { Id, QueryCtx, TableNames } from '#types';
import type { SystemTableNames } from '@-/convex/server';
import { z } from '@-/zod';

export const getIdSchema = <$TableName extends TableNames | SystemTableNames>(
	ctx: QueryCtx,
	tableName: $TableName,
) =>
	z.custom<Id<$TableName>>((id) => {
		if (typeof id === 'string') {
			if (tableName !== '_storage' && tableName !== '_scheduled_functions') {
				return ctx.db.normalizeId(tableName, id) !== null;
			} else {
				return true;
			}
		} else {
			return false;
		}
	});

export const idSchema = <$TableName extends TableNames>(
	_tableName: $TableName,
) =>
	// Make sure it's not a CUID (which is what we used to use instead of Convex IDs)
	z.custom<Id<$TableName>>((id) => typeof id === 'string' && id.length !== 24);
