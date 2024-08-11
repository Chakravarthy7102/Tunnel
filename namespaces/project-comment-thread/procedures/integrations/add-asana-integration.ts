import { ApiConvex } from '@-/convex/api';
import { ProcedureError } from '@-/errors';
import { OrganizationMemberRoleInput } from '@-/organization-member';
import { WebappApiInput } from '@-/webapp/api-input';
import { defineProcedure } from '@-/webapp/procedure-utils';
import { z } from '@-/zod';
import { $try } from 'errok';

export const projectCommentThread_addAsanaIntegration = defineProcedure({
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
			createdAsanaTask: z.any(), // TODO: strictly type
		})),
	mutation: async ({ input }) => ($try(async function*() {
		const {
			organization,
			project,
			projectCommentThread,
			createdAsanaTask,
		} = input;

		const {
			gid,
			project: asanaProject,
			url,
			assignee,
			// parentTask,
			section,
		} = createdAsanaTask;

		const organizationId = yield* organization.safeUnwrap();
		const projectId = yield* project.safeUnwrap();
		const projectCommentThreadId = yield* projectCommentThread
			.safeUnwrap();

		const createdAsanaTaskResponse = yield* ApiConvex.v.ProjectAsanaTask.create(
			{
				input: {
					data: {
						organization: organizationId,
						project: projectId,
						gid,
						asanaProject,
						url,
						assignee,
						parentTask: null,
						section,
						// status,
					},
				},
			},
		).safeUnwrap();

		return ApiConvex.v.ProjectCommentThreadAsanaTaskRelation.create({
			input: {
				data: {
					projectCommentThread: projectCommentThreadId,
					projectAsanaTask: createdAsanaTaskResponse,
				},
				include: {
					projectCommentThread: true,
					projectAsanaTask: {
						include: {
							tags: true,
						},
					},
				},
			},
		});
	})),
	error: ({ error }) => new ProcedureError("Couldn't link Asana", error),
});
