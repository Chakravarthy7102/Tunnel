import type { ActorMetaschema, Context } from '#types';
import type { Id } from '@-/database';
import { $try, err, ok } from 'errok';
import { getActorRefDataFromActorMetaschema } from './actor.ts';

export const refineHasProjectLivePreviewPermission = (
	{
		ctx,
		actorMetaschema,
	}: {
		ctx: Context;
		actorMetaschema: ActorMetaschema;
		projectLivePreviewId: Id<'ProjectLivePreview'>;
	},
) => ($try(async function*() {
	const actorRefData = yield* getActorRefDataFromActorMetaschema({
		actorMetaschema,
		ctx,
	}).safeUnwrap();

	if (actorRefData === null || actorRefData.type !== 'User') {
		return err(new Error('Actor must be authorized as a user'));
	}

	// const isAuthorized = true;

	// if (!isAuthorized) {
	// 	return err(
	// 		new Error(
	// 			'Actor does not have permission to view project live preview.',
	// 		),
	// 	);
	// }

	return ok(true);
}));

export const refineProjectLivePreviewActorRelation = ({
	projectLivePreviewId,
	actor: actorMetaschema,
	actorRelation,
	ctx,
}:
	& {
		ctx: Context;
		projectLivePreviewId: Id<'ProjectLivePreview'>;
	}
	& (
		| {
			actor: ActorMetaschema;
			actorRelation: 'host' | 'hasPermission' | 'anyone';
		}
		| {
			actor: null;
			actorRelation: 'anyone';
		}
	)) => ($try(async function*() {
		// Fix: tunnel permissions
		if (actorRelation === 'anyone') {
			return ok();
		}

		if (actorRelation === 'host') {
			const actorRefData = yield* getActorRefDataFromActorMetaschema({
				actorMetaschema,
				ctx,
			}).safeUnwrap();

			if (actorRefData === null || actorRefData.type !== 'User') {
				return err(new Error('Actor must be authorized as a user'));
			}

			// TODO: Permissions

			return ok();
		} // Has permission
		else {
			return refineHasProjectLivePreviewPermission({
				ctx,
				actorMetaschema,
				projectLivePreviewId,
			});
		}
	}));
