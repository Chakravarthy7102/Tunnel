import { ApiConvex } from '@-/convex/api';
import { ProcedureError } from '@-/errors';
import { ApiProjectCommentThread } from '@-/project-comment-thread/api';
import { WebappApiInput } from '@-/webapp/api-input';
import { defineProcedure } from '@-/webapp/procedure-utils';
import { z } from '@-/zod';
import { $try, ok } from 'errok';

export const projectComment_delete = defineProcedure({
	input: WebappApiInput.withActor(
		'User',
		(actor, { input, ctx }) =>
			z.object({
				projectComment: WebappApiInput.projectComment({
					actor,
					actorRelation: 'author',
				})(input, ctx),
			}),
	),
	mutation: async ({ input }) => ($try(async function*() {
		const projectCommentId = yield* input.projectComment.safeUnwrap();
		const projectComment = yield* ApiConvex.v.ProjectComment.get({
			from: { id: projectCommentId },
			include: {
				parentCommentThread: true,
			},
		}).safeUnwrap();

		if (projectComment === null) {
			return ok();
		}

		const projectCommentThreadId = projectComment.parentCommentThread._id;

		const firstComment = yield* ApiConvex.v.ProjectComment.getFirstInThread({
			projectCommentThreadId,
			include: {},
		}).safeUnwrap();

		if (projectCommentId === firstComment?._id) {
			yield* ApiProjectCommentThread.delete({
				input: { id: projectCommentThreadId },
			}).safeUnwrap();
		} else {
			yield* ApiConvex.v.ProjectComment.delete({
				input: {
					id: projectCommentId,
				},
			}).safeUnwrap();
		}

		return ok();
	})),
	error: ({ error }) => new ProcedureError("Couldn't delete comment", error),
});
