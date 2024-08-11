import type { TableNames } from '#types';
import { v } from '@-/convex/values';

export function vId<$TableName extends TableNames>(tableName: $TableName) {
	return v.union(v.id(tableName), v.string());
}
