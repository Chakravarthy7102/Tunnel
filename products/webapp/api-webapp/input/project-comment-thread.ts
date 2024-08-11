import type { ActorMetaschema, Context } from '#types';
import { ApiConvex } from '@-/convex/api';
import { idSchema } from '@-/database/schemas';
import { DocumentNotFoundError } from '@-/errors';
import { z } from '@-/zod';
import { $try, err, ok } from 'errok';
import { getActorRefDataFromActorMetaschema } from './internal/_.ts';

interface ProjectCommentThreadRefinerOptions {
	actor: ActorMetaschema;
	actorRelation:
		| 'author'
		| 'adminOrHigherOrAuthor'
		| 'hasProjectLivePreviewPermission'
		| 'any';
}

/**
	@example ```
		WebappApiInput.projectCommentThread(options)(input, ct)
	```
*/
export function WebappApiInput_projectCommentThread(
	options: ProjectCommentThreadRefinerOptions,
) {
	return function(_input: unknown, ctx: Context) {
		return z
			.object({ id: idSchema('ProjectCommentThread') })
			.transform(async ({ id }) => ($try(async function*() {
				const projectCommentThread = yield* ApiConvex.v.ProjectCommentThread
					.get({
						from: { id },
						include: {},
					}).safeUnwrap();

				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- todo
				if (projectCommentThread === null) {
					return err(new DocumentNotFoundError('ProjectCommentThread'));
				}

				if (options.actorRelation === 'any') {
					return ok(projectCommentThread._id);
				}

				const firstComment = yield* ApiConvex.v.ProjectComment.getFirstInThread(
					{
						projectCommentThreadId: projectCommentThread._id,
						include: {
							organization: true,
							authorUser: true,
						},
					},
				).safeUnwrap();

				if (firstComment === null) {
					return err(
						new Error('The comment thread does not have any comments'),
					);
				}

				const actorRefData = yield* getActorRefDataFromActorMetaschema({
					actorMetaschema: options.actor,
					ctx,
				}).safeUnwrap();

				if (actorRefData === null || actorRefData.type !== 'User') {
					return err(new Error('Actor must be a user.'));
				}

				const organizationMember = yield* ApiConvex.v.OrganizationMember.get({
					from: {
						organization: firstComment.organization._id,
						user: actorRefData.id,
					},
					include: {},
				}).safeUnwrap();

				if (options.actorRelation === 'author') {
					if (actorRefData.id !== firstComment.authorUser?._id) {
						return err(
							new Error(
								'Actor must be the author of the tunnel session comment.',
							),
						);
					}
				}

				if (options.actorRelation === 'adminOrHigherOrAuthor') {
					if (
						organizationMember &&
						!['admin', 'owner'].includes(
							organizationMember.role,
						) && actorRefData.id !== firstComment.authorUser?._id
					) {
						return err(
							new Error(
								'Actor must be an admin or higher or the author of the tunnel session comment.',
							),
						);
					}
				}

				return ok(projectCommentThread._id);
			})));
	};
}
