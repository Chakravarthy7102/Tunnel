import type { ActorMetaschema, Context } from '#types';
import { ApiConvex } from '@-/convex/api';
import { idSchema } from '@-/database/schemas';
import { DocumentNotFoundError } from '@-/errors';
import { z } from '@-/zod';
import { $try, err, ok } from 'errok';
import { getActorRefDataFromActorMetaschema } from './internal/actor.ts';

type TunnelInstanceProxyPreviewRefinerOptions =
	& {
		identifier: 'id';
	}
	& (
		| {
			actor: ActorMetaschema;
			actorRelation: 'creator' | 'anyone';
		}
		| {
			actor: null;
			actorRelation: 'anyone';
		}
	);

/**
	@example ```
		WebappApiInput.tunnelInstanceProxyPreview(options)(input, ctx)
	```
*/
export function WebappApiInput_tunnelInstanceProxyPreview<
	$tunnelInstanceProxyPreviewRefinerOptions
		extends TunnelInstanceProxyPreviewRefinerOptions,
>(
	options: $tunnelInstanceProxyPreviewRefinerOptions,
) {
	return function(input: unknown, ctx: Context) {
		return z
			.object({ id: idSchema('TunnelInstanceProxyPreview') })
			.transform(async ({ id }) => ($try(async function*() {
				const tunnelInstanceProxyPreview = yield* ApiConvex.v
					.TunnelInstanceProxyPreview
					.get({
						from: { id },
						include: {
							createdByUser: true,
						},
					}).safeUnwrap();

				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- todo
				if (tunnelInstanceProxyPreview === null) {
					return err(new DocumentNotFoundError('TunnelInstanceProxyPreview'));
				}

				if (options.actorRelation === 'anyone') {
					return ok(tunnelInstanceProxyPreview._id);
				}

				const actorRefData = yield* getActorRefDataFromActorMetaschema({
					actorMetaschema: options.actor,
					ctx,
				}).safeUnwrap();

				if (actorRefData === null || actorRefData.type !== 'User') {
					return err(new Error('Actor must be authorized as a user'));
				}

				if (
					tunnelInstanceProxyPreview.createdByUser._id !== actorRefData.id
				) {
					return err(
						new Error(
							'Actor must be the creator of the tunnel session.',
						),
					);
				}

				return ok(tunnelInstanceProxyPreview._id);
			})));
	};
}
