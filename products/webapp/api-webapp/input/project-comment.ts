import type { ActorMetaschema, Context } from '#types';
import { ApiConvex } from '@-/convex/api';
import { idSchema } from '@-/database/schemas';
import { DocumentNotFoundError } from '@-/errors';
import { z } from '@-/zod';
import { $try, err, ok } from 'errok';
import {
	getActorRefDataFromActorMetaschema,
	refineHasProjectLivePreviewPermission,
} from './internal/_.ts';

interface ProjectCommentRefinerOptions {
	actor: ActorMetaschema;
	actorRelation: 'author' | 'hasProjectPermission';
}

/**
	@example ```
		WebappApiInput.actorProjectComment(actor, {
			actorRelation: 'author',
		})(input, ctx)
	```
*/
export function WebappApiInput_projectComment(
	options: ProjectCommentRefinerOptions,
) {
	return function(_input: unknown, ctx: Context) {
		return z
			.object({ id: idSchema('ProjectComment') })
			.transform(async ({ id }) => ($try(async function*() {
				const projectComment = yield* ApiConvex.v.ProjectComment.get({
					from: { id },
					include: {
						authorUser: true,
						parentCommentThread: {
							include: {
								linkedProjectLivePreview: true,
							},
						},
					},
				}).safeUnwrap();

				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- todo
				if (projectComment === null) {
					return err(new DocumentNotFoundError('ProjectComment'));
				}

				const actorRefData = yield* getActorRefDataFromActorMetaschema({
					actorMetaschema: options.actor,
					ctx,
				}).safeUnwrap();

				const {
					authorUser,
					parentCommentThread: { linkedProjectLivePreview },
				} = projectComment;

				if (linkedProjectLivePreview !== null) {
					const projectLivePreviewId = linkedProjectLivePreview._id;
					if (options.actorRelation === 'author') {
						if (
							actorRefData === null || actorRefData.id !== authorUser?._id
						) {
							return err(new Error('Actor must be the author of the comment.'));
						}
					} // actorRelation === 'hasProjectLivePreviewPermission'
					else {
						yield* refineHasProjectLivePreviewPermission({
							ctx,
							projectLivePreviewId,
							actorMetaschema: options.actor,
						}).safeUnwrap();
					}
				}

				return ok(projectComment._id);
			})));
	};
}
