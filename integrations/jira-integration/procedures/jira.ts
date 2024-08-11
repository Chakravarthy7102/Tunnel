import { ApiJira } from '#api';
import { ProcedureError } from '@-/errors';
import {
	jiraAssigneeSchema,
	jiraIssueTypeSchema,
	jiraParentIssueSchema,
	jiraProjectSchema,
} from '@-/integrations/schemas';
import { OrganizationMemberRoleInput } from '@-/organization-member';
import { WebappApiInput } from '@-/webapp/api-input';
import { z } from '@-/zod';
import { $try, ok } from 'errok';
// eslint-disable-next-line @tunnel/no-relative-import-paths/no-relative-import-paths -- This breaks Next.js dev for some reason
import { defineProcedure } from '../../../products/webapp/exports/procedure-utils.ts';

export const jira_createIssue = defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.object({
			organizationMember: WebappApiInput.organizationMember({
				actor,
				actorRelation: 'actor',
				actorOrganizationMemberRole: OrganizationMemberRoleInput.guestOrHigher,
			})(input, ctx),
			project: jiraProjectSchema,
			assignee: jiraAssigneeSchema.nullable(),
			issueType: jiraIssueTypeSchema.nullable(),
			parentIssue: jiraParentIssueSchema.nullable(),
			labels: z.array(z.string()),
			tunnelUrl: z.string(),
			title: z.string().nullable().optional(),
			description: z.string().nullable(),
			attachments: z.array(z.string()),
		})),
	mutation: async ({ input }) => ($try(async function*() {
		const { organizationMember, ...data } = input;
		const organizationMemberId = yield* organizationMember.safeUnwrap();
		return ApiJira.createIssue({
			organizationMemberId,
			title: data.title,
			...data,
		});
	})),
	error: ({ error }) =>
		new ProcedureError(
			"Couldn't create Jira issue",
			error,
		),
});

export const jira_getProjects = defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.object({
			organizationMember: WebappApiInput.organizationMember({
				actor,
				actorRelation: 'actor',
				actorOrganizationMemberRole: OrganizationMemberRoleInput.guestOrHigher,
			})(input, ctx),
		})),
	query: async ({ input }) => ($try(async function*() {
		const organizationMemberId = yield* input.organizationMember.safeUnwrap();
		const jiraClient = yield* ApiJira.getClient({
			organizationMemberId,
		}).safeUnwrap();
		return ok(await jiraClient.projects.searchProjects());
	})),
	error: ({ error }) => new ProcedureError("Couldn't get Jira projects", error),
});

export const jira_getProjectIssueTypes = defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.object({
			organizationMember: WebappApiInput.organizationMember({
				actor,
				actorRelation: 'actor',
				actorOrganizationMemberRole: OrganizationMemberRoleInput.guestOrHigher,
			})(input, ctx),
			projectId: z.string(),
		})),
	query: async ({ input }) => ($try(async function*() {
		const organizationMemberId = yield* input.organizationMember.safeUnwrap();
		const jiraClient = yield* ApiJira.getClient({
			organizationMemberId,
		}).safeUnwrap();
		return ok(
			await jiraClient.issueTypes.getIssueTypesForProject({
				projectId: Number(input.projectId),
			}),
		);
	})),
	error: ({ error }) =>
		new ProcedureError("Couldn't get Jira issue types", error),
});

export const jira_getLabels = defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.object({
			organizationMember: WebappApiInput.organizationMember({
				actor,
				actorRelation: 'actor',
				actorOrganizationMemberRole: OrganizationMemberRoleInput.guestOrHigher,
			})(input, ctx),
		})),
	query: async ({ input }) => ($try(async function*() {
		const organizationMemberId = yield* input.organizationMember.safeUnwrap();
		const jiraClient = yield* ApiJira.getClient({
			organizationMemberId,
		}).safeUnwrap();
		return ok(
			await jiraClient.labels.getAllLabels(),
		);
	})),
	error: ({ error }) =>
		new ProcedureError("Couldn't get Jira issue labels", error),
});

export const jira_getUsers = defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.object({
			organizationMember: WebappApiInput.organizationMember({
				actor,
				actorRelation: 'actor',
				actorOrganizationMemberRole: OrganizationMemberRoleInput.guestOrHigher,
			})(input, ctx),
			query: z.string(),
		})),
	query: async ({ input }) => ($try(async function*() {
		const organizationMemberId = yield* input.organizationMember.safeUnwrap();
		const jiraClient = yield* ApiJira.getClient({
			organizationMemberId,
		}).safeUnwrap();
		return ok(
			await jiraClient.groupAndUserPicker.findUsersAndGroups({
				showAvatar: true,
				query: input.query,
			}),
		);
	})),
	error: ({ error }) =>
		new ProcedureError("Couldn't get users from Jira", error),
});

export const jira_getIssue = defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.object({
			organizationMember: WebappApiInput.organizationMember({
				actor,
				actorRelation: 'actor',
				actorOrganizationMemberRole: OrganizationMemberRoleInput.guestOrHigher,
			})(input, ctx),
			query: z.string(),
			projectId: z.string(),
		})),
	query: async ({ input }) => ($try(async function*() {
		const organizationMemberId = yield* input.organizationMember.safeUnwrap();
		const jiraClient = yield* ApiJira.getClient({
			organizationMemberId,
		}).safeUnwrap();
		return ok(
			await jiraClient.issueSearch.getIssuePickerResource({
				currentProjectId: input.projectId,
				query: input.query,
			}),
		);
	})),
	error: ({ error }) =>
		new ProcedureError(
			"Couldn't get issue from Jira organization",
			error,
		),
});
