import type { ActorMetaschema, Context } from '#types';
import { ApiConvex } from '@-/convex/api';
import { idSchema } from '@-/database/schemas';
import { DocumentNotFoundError } from '@-/errors';
import { z } from '@-/zod';
import { unreachableCase } from '@tunnel/ts';
import { $try, err, ok } from 'errok';
import { refineProjectLivePreviewActorRelation } from './internal/_.ts';

type ProjectLivePreviewRefinerOptions =
	& { identifier: 'id' | 'url' }
	& (
		| {
			actor: ActorMetaschema;
			actorRelation: 'host' | 'hasPermission' | 'anyone';
		}
		| {
			actor: null;
			actorRelation: 'anyone';
		}
	);

function _projectLivePreviewIdSchema({
	options,
	ctx,
}: {
	options: ProjectLivePreviewRefinerOptions;
	ctx: Context;
}) {
	return z
		.object({ id: idSchema('ProjectLivePreview') })
		.transform(async ({ id }) => ($try(async function*() {
			const projectLivePreview = yield* ApiConvex.v.ProjectLivePreview.get({
				from: { id },
				include: {},
			}).safeUnwrap();

			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- todo
			if (projectLivePreview === null) {
				return err(new DocumentNotFoundError('ProjectLivePreview'));
			}

			yield* refineProjectLivePreviewActorRelation({
				...options,
				projectLivePreviewId: projectLivePreview._id,
				ctx,
			}).safeUnwrap();

			return ok(projectLivePreview._id);
		})));
}

function _projectLivePreviewUrlSchema({
	ctx,
	options,
}: {
	ctx: Context;
	options: ProjectLivePreviewRefinerOptions;
}) {
	return z
		.object({ url: z.string() })
		.transform(async ({ url }) => ($try(async function*() {
			const projectLivePreview = yield* ApiConvex.v.ProjectLivePreview.get({
				from: { tunnelappUrl: url },
				include: {},
			}).safeUnwrap();

			if (projectLivePreview === null) {
				return err(new DocumentNotFoundError('ProjectLivePreview'));
			}

			yield* refineProjectLivePreviewActorRelation({
				...options,
				projectLivePreviewId: projectLivePreview._id,
				ctx,
			}).safeUnwrap();

			return ok(projectLivePreview._id);
		})));
}

/**
	@example ```
		WebappApiInput.projectLivePreview(options)(input, ctx)
	```
*/
// dprint-ignore
export function WebappApiInput_projectLivePreview<
	$ProjectLivePreviewRefinerOptions extends ProjectLivePreviewRefinerOptions
>( options: $ProjectLivePreviewRefinerOptions):
	(input: unknown, ctx: Context) =>
		$ProjectLivePreviewRefinerOptions['identifier'] extends 'id' ?
			ReturnType<typeof _projectLivePreviewIdSchema> :
		$ProjectLivePreviewRefinerOptions['identifier'] extends 'url' ?
			ReturnType<typeof _projectLivePreviewUrlSchema> :
		never;
export function WebappApiInput_projectLivePreview(
	options: ProjectLivePreviewRefinerOptions,
): (
	input: unknown,
	ctx: Context,
) =>
	| ReturnType<typeof _projectLivePreviewIdSchema>
	| ReturnType<typeof _projectLivePreviewUrlSchema>
{
	return function(input: unknown, ctx: Context) {
		switch (options.identifier) {
			case 'id': {
				return _projectLivePreviewIdSchema({
					ctx,
					options,
				});
			}

			case 'url': {
				return _projectLivePreviewUrlSchema({
					ctx,
					options,
				});
			}

			default: {
				return unreachableCase(
					options.identifier,
					`Invalid identifier option: ${JSON.stringify(options.identifier)}`,
				);
			}
		}
	};
}
