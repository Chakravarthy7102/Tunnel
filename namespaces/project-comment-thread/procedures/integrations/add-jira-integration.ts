import { ApiConvex } from '@-/convex/api';
import { ProcedureError } from '@-/errors';
import { OrganizationMemberRoleInput } from '@-/organization-member';
import { WebappApiInput } from '@-/webapp/api-input';
import { defineProcedure } from '@-/webapp/procedure-utils';
import { z } from '@-/zod';
import { $try } from 'errok';

export const projectCommentThread_addJiraIntegration = defineProcedure({
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
			createdJiraIssue: z.any(), // TODO: strictly type
		})),
	mutation: async ({ input }) => ($try(async function*() {
		const {
			organization,
			project,
			projectCommentThread,
			createdJiraIssue,
		} = input;

		const {
			id: issueId,
			key,
			self,
			url,
			project: jiraProject,
			assignee,
			issueType,
			parentIssue,
		} = createdJiraIssue;

		const organizationId = yield* organization.safeUnwrap();
		const projectId = yield* project.safeUnwrap();
		const projectCommentThreadId = yield* projectCommentThread
			.safeUnwrap();

		const createdJiraIssueResponse = yield* ApiConvex.v.ProjectJiraIssue.create(
			{
				input: {
					data: {
						organization: organizationId,
						project: projectId,
						issueId,
						key,
						self,
						url,
						jiraProject,
						assignee,
						issueType,
						parentIssue,
					},
				},
			},
		).safeUnwrap();

		return ApiConvex.v.ProjectCommentThreadJiraIssueRelation.create({
			input: {
				data: {
					projectCommentThread: projectCommentThreadId,
					projectJiraIssue: createdJiraIssueResponse,
				},
				include: {
					projectCommentThread: true,
					projectJiraIssue: true,
				},
			},
		});
	})),
	error: ({ error }) => new ProcedureError("Couldn't link Jira", error),
});
