import { ApiLinear } from '#api';
import { ApiAnalytics } from '@-/analytics/api';
import { ApiConvex } from '@-/convex/api';
import { DocumentNotFoundError, ProcedureError } from '@-/errors';
import type { LinearIssue } from '@-/integrations';
import {
	linearAssigneeSchema,
	linearLabelSchema,
	linearPrioritySchema,
	linearProjectSchema,
	linearStatusSchema,
	linearTeamSchema,
} from '@-/integrations/schemas';
import { OrganizationMemberRoleInput } from '@-/organization-member';
import { WebappApiInput } from '@-/webapp/api-input';
import { z } from '@-/zod';
import { $try, err, ok, type TryOk } from 'errok';
// eslint-disable-next-line @tunnel/no-relative-import-paths/no-relative-import-paths -- This breaks Next.js dev for some reason
import { defineProcedure } from '../../../products/webapp/exports/procedure-utils.ts';

export const linear_createIssue = defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.object({
			organizationMember: WebappApiInput.organizationMember({
				actor,
				actorRelation: 'actor',
				actorOrganizationMemberRole: OrganizationMemberRoleInput.guestOrHigher,
			})(input, ctx),
			team: linearTeamSchema,
			project: linearProjectSchema.nullable(),
			priority: linearPrioritySchema.nullable(),
			status: linearStatusSchema.nullable(),
			labels: z.array(linearLabelSchema),
			assignee: linearAssigneeSchema.nullable(),
			tunnelUrl: z.string(),
			title: z.string().nullable().optional(),
			description: z.string(),
			attachments: z.array(z.string()),
		})),
	mutation: async ({ input }) => ($try(async function*(
		$ok: TryOk<LinearIssue | null>,
	) {
		const organizationMemberId = yield* input.organizationMember.safeUnwrap();
		const {
			team,
			project,
			priority,
			status,
			labels,
			assignee,
			title,
			tunnelUrl,
			description,
			attachments,
		} = input;

		const organizationMember = yield* ApiConvex.v.OrganizationMember.get({
			from: { id: organizationMemberId },
			include: {
				organization: true,
				user: true,
				linkedLinearAccount: true,
			},
		}).safeUnwrap();

		if (organizationMember === null) {
			return err(new DocumentNotFoundError('OrganizationMember'));
		}

		const linearClient = yield* ApiLinear.getClient({
			organizationMemberId,
		}).safeUnwrap();

		const formattedAttachments = attachments.length > 0 ?
			attachments
				.map(
					(attachment) =>
						`![Attachment ${
							attachments.indexOf(attachment) + 1
						}](${attachment})`,
				)
				.join('\n') :
			'';

		const { issue } = await linearClient.createIssue({
			teamId: team.id,
			assigneeId: assignee?.id,
			projectId: project?.id,
			labelIds: labels.map((label) => label.id),
			stateId: status?.id,
			title,
			priority: priority?.priority,
			description: `${description}\n\n${formattedAttachments}`,
		});

		if (!issue) {
			return $ok(null);
		}

		const { identifier, id, url } = await issue;

		if (organizationMember.linkedLinearAccount) {
			await linearClient.issueSubscribe(id);
		}

		await linearClient.createAttachment({
			issueId: id,
			title: 'Tunnel Preview',
			commentBody: description,
			url: tunnelUrl,
			iconUrl: 'https://tunnel.dev/assets/images/logo.png',
		});

		const serverAnalytics = ApiAnalytics.getServerAnalytics();
		void serverAnalytics.user.createdLinearIssue({
			userId: organizationMember.user._id,
			organizationId: organizationMember._id,
		});

		return $ok({
			team,
			project,
			priority,
			status,
			labels,
			assignee,
			identifier,
			id,
			url,
		});
	})),
	error: ({ error }) =>
		new ProcedureError(
			"Couldn't create Linear issue",
			error,
		),
});

export const linear_getTeams = defineProcedure({
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
		const linearClient = yield* ApiLinear.getClient({
			organizationMemberId,
		}).safeUnwrap();

		const teams = (await linearClient.teams()).nodes;
		return ok(teams.map((team) => ({
			id: team.id,
			name: team.name,
		})));
	})),
	error: ({ error }) =>
		new ProcedureError(
			"Couldn't get Linear teams",
			error,
		),
});

export const linear_getProjects = defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.object({
			organizationMember: WebappApiInput.organizationMember({
				actor,
				actorRelation: 'actor',
				actorOrganizationMemberRole: OrganizationMemberRoleInput.guestOrHigher,
			})(input, ctx),
			teamId: z.string(),
		})),
	query: async ({ input }) => ($try(async function*() {
		const organizationMemberId = yield* input.organizationMember.safeUnwrap();
		const linearClient = yield* ApiLinear.getClient({
			organizationMemberId,
		}).safeUnwrap();

		try {
			const team = await linearClient.team(input.teamId);
			const projects = (await team.projects()).nodes;
			return ok(projects);
		} catch {
			return ok([]);
		}
	})),
	error: ({ error }) =>
		new ProcedureError(
			"Couldn't get projects from Linear",
			error,
		),
});

export const linear_getPriorities = defineProcedure({
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
		const linearClient = yield* ApiLinear.getClient({
			organizationMemberId,
		}).safeUnwrap();

		const priorities = await linearClient.issuePriorityValues;
		return ok(priorities);
	})),
	error: ({ error }) =>
		new ProcedureError(
			"Couldn't get issue priorities from Linear",
			error,
		),
});

export const linear_getTeamMembers = defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.object({
			organizationMember: WebappApiInput.organizationMember({
				actor,
				actorRelation: 'actor',
				actorOrganizationMemberRole: OrganizationMemberRoleInput.guestOrHigher,
			})(input, ctx),
			teamId: z.string(),
		})),
	query: async ({ input }) => ($try(async function*() {
		const organizationMemberId = yield* input.organizationMember.safeUnwrap();
		const linearClient = yield* ApiLinear.getClient({
			organizationMemberId,
		}).safeUnwrap();

		try {
			const team = await linearClient.team(input.teamId);
			const members = (await team.members()).nodes;
			return ok(members);
		} catch {
			return ok([]);
		}
	})),
	error: ({ error }) =>
		new ProcedureError(
			"Couldn't get team members from Linear",
			error,
		),
});

export const linear_getWorkflowStates = defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.object({
			organizationMember: WebappApiInput.organizationMember({
				actor,
				actorRelation: 'actor',
				actorOrganizationMemberRole: OrganizationMemberRoleInput.guestOrHigher,
			})(input, ctx),
			teamId: z.string(),
		})),
	query: async ({ input }) => ($try(async function*() {
		const organizationMemberId = yield* input.organizationMember.safeUnwrap();
		const linearClient = yield* ApiLinear.getClient({
			organizationMemberId,
		}).safeUnwrap();

		const workflowStates = (
			await linearClient.workflowStates({
				filter: {
					team: {
						id: {
							in: [input.teamId],
						},
					},
				},
			})
		).nodes;

		return ok(workflowStates);
	})),
	error: ({ error }) =>
		new ProcedureError(
			"Couldn't get workflow states from Linear",
			error,
		),
});

export const linear_getLabels = defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.object({
			organizationMember: WebappApiInput.organizationMember({
				actor,
				actorRelation: 'actor',
				actorOrganizationMemberRole: OrganizationMemberRoleInput.guestOrHigher,
			})(input, ctx),
			teamId: z.string(),
		})),
	query: async ({ input }) => ($try(async function*() {
		const organizationMemberId = yield* input.organizationMember.safeUnwrap();
		const linearClient = yield* ApiLinear.getClient({
			organizationMemberId,
		}).safeUnwrap();

		const labels = (
			await linearClient.issueLabels({
				filter: {
					team: {
						or: [
							{
								null: true,
							},
							{
								id: {
									in: [input.teamId],
								},
							},
						],
					},
				},
			})
		).nodes;

		return ok(labels.filter((label) => !label.isGroup));
	})),
	error: ({ error }) =>
		new ProcedureError(
			"Couldn't get issue labels from Linear",
			error,
		),
});
