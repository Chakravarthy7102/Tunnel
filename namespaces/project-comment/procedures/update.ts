import { projectCommentContentSchema } from '#schemas/content.ts';
import { ApiConvex } from '@-/convex/api';
import { ProcedureError } from '@-/errors';
import { WebappApiInput } from '@-/webapp/api-input';
import { defineProcedure } from '@-/webapp/procedure-utils';
import { z } from '@-/zod';
import { $try } from 'errok';

export const projectComment_update = defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.object({
			comment: WebappApiInput.projectComment({
				actor,
				actorRelation: 'author',
			})(input, ctx),
			updates: z.object({
				content: z.array(projectCommentContentSchema),
			}),
		})),
	mutation: async ({ input }) => ($try(async function*() {
		const commentId = yield* input.comment.safeUnwrap();
		return ApiConvex.v.ProjectComment.update({
			input: {
				id: commentId,
				updates: input.updates,
			},
		});
	})),
	error: ({ error }) => new ProcedureError("Couldn't update comment", error),
});
