import { ApiProjectCommentThread } from '#api';
import { ProcedureError } from '@-/errors';
import { WebappApiInput } from '@-/webapp/api-input';
import { defineProcedure } from '@-/webapp/procedure-utils';
import { z } from '@-/zod';
import { $try, ok } from 'errok';

export const projectCommentThread_delete = defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.object({
			projectCommentThread: WebappApiInput.projectCommentThread({
				actor,
				actorRelation: 'adminOrHigherOrAuthor',
			})(input, ctx),
		})),
	mutation: async ({ input }) => ($try(async function*() {
		const commentThreadId = yield* input.projectCommentThread.safeUnwrap();
		yield* ApiProjectCommentThread.delete({
			input: { id: commentThreadId },
		}).safeUnwrap();

		return ok();
	})),
	error: ({ error }) => new ProcedureError("Couldn't delete comment", error),
});
