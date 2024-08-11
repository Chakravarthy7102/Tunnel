import { ApiProjectCommentThread } from '#api';
import { ApiAnalytics } from '@-/analytics/api';
import { ApiConvex } from '@-/convex/api';
import { DocumentNotFoundError, ProcedureError } from '@-/errors';
import { hostEnvironmentTypeSchema } from '@-/host-environment/schemas';
import { WebappApiInput } from '@-/webapp/api-input';
import { defineProcedure } from '@-/webapp/procedure-utils';
import { z } from '@-/zod';
import { $try, err, ok } from 'errok';

export const projectCommentThread_resolve = defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.object({
			resolvedByUser: WebappApiInput.user({
				actor,
				actorRelation: 'actor',
			})(input, ctx),
			commentThread: WebappApiInput.projectCommentThread({
				actor,
				actorRelation: 'hasProjectLivePreviewPermission',
			})(input, ctx),
			hostEnvironmentType: hostEnvironmentTypeSchema.nullable(),
		})),
	mutation: async ({ input }) => ($try(async function*() {
		const resolvedByUserId = yield* input.resolvedByUser.safeUnwrap();
		const commentThreadId = yield* input.commentThread.safeUnwrap();

		const commentThread = yield* ApiConvex.v.ProjectCommentThread.get({
			from: {
				id: commentThreadId,
			},
			include: {
				organization: true,
			},
		}).safeUnwrap();

		if (commentThread === null) {
			return err(new DocumentNotFoundError('ProjectCommentThread'));
		}

		yield* ApiProjectCommentThread.resolve({
			resolvedByUserId,
			commentThreadId,
			shouldRunSideEffects: true,
		}).safeUnwrap();

		const serverAnalytics = ApiAnalytics.getServerAnalytics();
		void serverAnalytics.user.resolvedCommentThread({
			userId: resolvedByUserId,
			hostEnvironmentType: input.hostEnvironmentType,
			commentThreadId,
			organizationId: commentThread.organization._id,
		});
		return ok();
	})),
	error: ({ error }) => new ProcedureError("Couldn't resolve comment", error),
});

export const projectCommentThread_unresolve = defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.object({
			commentThread: WebappApiInput.projectCommentThread({
				actor,
				actorRelation: 'hasProjectLivePreviewPermission',
			})(input, ctx),
		})),
	mutation: async ({ input }) => ($try(async function*() {
		const commentThreadId = yield* input.commentThread.safeUnwrap();
		return ApiProjectCommentThread.unresolve({
			projectCommentThreadId: commentThreadId,
		});
	})),
	error: ({ error }) => new ProcedureError("Couldn't resolve comment", error),
});
