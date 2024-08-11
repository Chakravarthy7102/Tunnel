import { ApiConvex } from '@-/convex/api';
import { ProcedureError } from '@-/errors';
import { OrganizationMemberRoleInput } from '@-/organization-member';
import { WebappApiInput } from '@-/webapp/api-input';
import { defineProcedure } from '@-/webapp/procedure-utils';
import { z } from '@-/zod';
import { $try } from 'errok';

export const projectCommentThread_addLinearIntegration = defineProcedure({
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
			createdLinearIssue: z.any(), // TODO: strictly type
		})),
	mutation: async ({ input }) => ($try(async function*() {
		const {
			organization,
			project,
			projectCommentThread,
			createdLinearIssue,
		} = input;

		const organizationId = yield* organization.safeUnwrap();
		const projectId = yield* project.safeUnwrap();
		const projectCommentThreadId = yield* projectCommentThread
			.safeUnwrap();

		const {
			team,
			project: linearProject,
			priority,
			status,
			assignee,
			identifier,
			id: issueId,
			url: issueUrl,
		} = createdLinearIssue;

		const createdLinearIssueResponse = yield* ApiConvex.v.ProjectLinearIssue
			.create({
				input: {
					data: {
						organization: organizationId,
						project: projectId,
						team,
						linearProject,
						priority,
						status,
						assignee,
						identifier,
						issueId,
						issueUrl,
					},
				},
			}).safeUnwrap();

		return ApiConvex.v.ProjectCommentThreadLinearIssueRelation.create({
			input: {
				data: {
					projectCommentThread: projectCommentThreadId,
					projectLinearIssue: createdLinearIssueResponse,
				},
				include: {
					projectCommentThread: true,
					projectLinearIssue: true,
				},
			},
		});
	})),
	error: ({ error }) => new ProcedureError("Couldn't link Linear", error),
});
