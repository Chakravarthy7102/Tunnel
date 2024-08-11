import type { ArgsWithToken, QueryCtx } from '@-/database';
import { getActorUser } from '@-/database/function-utils';
import { getIdSchema } from '@-/database/schemas';

interface TunnelInstanceProxyPreviewIdSchemaOptions {
	actorRelation: 'creator' | 'anyone';
}

export function getTunnelInstanceProxyPreviewIdSchema(
	ctx: QueryCtx,
	args: ArgsWithToken,
	options: TunnelInstanceProxyPreviewIdSchemaOptions,
) {
	return getIdSchema(ctx, 'TunnelInstanceProxyPreview').refine(async (id) => {
		const tunnelInstanceProxyPreview = await ctx.db.get(id);
		if (tunnelInstanceProxyPreview === null) {
			throw new Error('not found');
		}

		if (options.actorRelation === 'anyone') {
			return tunnelInstanceProxyPreview._id;
		}

		const actorUser = await getActorUser(ctx, args);
		if (actorUser._id !== tunnelInstanceProxyPreview.createdByUser) {
			throw new Error('User must be the creator');
		}

		return true;
	});
}
