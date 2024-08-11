import { ApiConvex } from '@-/convex/api';
import { ProcedureError } from '@-/errors';
import { OrganizationMemberRoleInput } from '@-/organization-member';
import { WebappApiInput } from '@-/webapp/api-input';
import { defineProcedure } from '@-/webapp/procedure-utils';
import { z } from '@-/zod';
import { $try } from 'errok';

export const projectCommentThread_addSlackIntegration = defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.object({
			organization: WebappApiInput.organization({
				actor,
				actorOrganizationMemberRole: OrganizationMemberRoleInput.memberOrHigher,
				plans: 'teamOrHigher',
			})(input, ctx),
			project: WebappApiInput.project({
				actor,
				actorOrganizationMemberRole: OrganizationMemberRoleInput.guestOrHigher,
			})(input, ctx),
			projectCommentThread: WebappApiInput.projectCommentThread({
				actor,
				actorRelation: 'hasProjectLivePreviewPermission',
			})(input, ctx),
			messageId: z.string(),
			channelId: z.string(),
			permalink: z.string(),
			parentTS: z.string(),
			channelName: z.string(),
		})),
	mutation: async ({ input }) => ($try(async function*() {
		const {
			organization,
			project,
			projectCommentThread,
			messageId,
			channelId,
			permalink,
			parentTS,
			channelName,
		} = input;

		const organizationId = yield* organization.safeUnwrap();
		const projectId = yield* project.safeUnwrap();
		const projectCommentThreadId = yield* projectCommentThread
			.safeUnwrap();

		const createdSlackMessage = yield* ApiConvex.v.ProjectSlackMessage.create({
			input: {
				data: {
					organization: organizationId,
					project: projectId,
					messageId,
					channelId,
					permalink,
					channelName,
				},
			},
		}).safeUnwrap();

		yield* ApiConvex.v.ProjectCommentThread.update({
			input: {
				id: projectCommentThreadId,
				updates: {
					slackMetadata: {
						channelId,
						messageId,
						permalink,
						parentTS,
						channelName,
					},
				},
			},
		}).safeUnwrap();

		return ApiConvex.v.ProjectCommentThreadSlackMessageRelation.create({
			input: {
				data: {
					projectCommentThread: projectCommentThreadId,
					projectSlackMessage: createdSlackMessage,
				},
				include: {
					projectCommentThread: true,
					projectSlackMessage: true,
				},
			},
		});
	})),
	error: ({ error }) => new ProcedureError("Couldn't link Slack", error),
});
