import { WebappApiInput } from '#api-input';
import { defineProcedure } from '#utils/procedure.ts';
import { ApiConvex } from '@-/convex/api';
import type { Selection } from '@-/database';
import { getInclude } from '@-/database/selection-utils';
import {
	Project_$dashboardPageData,
	Project_$organizationAndMembersData,
	Project_$organizationData,
} from '@-/database/selections';
import { ProcedureError } from '@-/errors';
import { ApiGitlab } from '@-/gitlab-integration/api';
import {
	asanaSettingsSchema,
	jiraSettingsSchema,
	linearSettingsSchema,
	slackChannelSchema,
} from '@-/integrations/schemas';
import { OrganizationMemberRoleInput } from '@-/organization-member';
import { z } from '@-/zod';
import { createId } from '@paralleldrive/cuid2';
import { unreachableCase } from '@tunnel/ts';
import { $try, ok } from 'errok';
import type { EmptyObject } from 'type-fest';

const buildProjectCreateProcedure = <
	$Selection extends Selection | EmptyObject,
>(
	selection: $Selection,
) => (defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.object({
			ownerOrganization: WebappApiInput.organization({
				actor,
				actorOrganizationMemberRole: OrganizationMemberRoleInput.memberOrHigher,
				plans: 'any',
			})(input, ctx),
			organizationMember: WebappApiInput.organizationMember({
				actor,
				actorOrganizationMemberRole: OrganizationMemberRoleInput.memberOrHigher,
				actorRelation: 'actor',
			})(input, ctx),
			name: z.string().nullable(),
			githubRepository: z
				.object({
					id: z.number(),
					url: z.string(),
					git_url: z.string(),
					html_url: z.string(),
					full_name: z.string(),
				})
				.nullable(),
			gitlabProject: z.object({
				id: z.number(),
				name: z.string(),
			}).nullable(),
			shouldLinkGithubRepository: z.boolean().optional(),
		})),
	mutation: async ({ input }) => ($try(async function*() {
		const ownerOrganizationId = yield* input.ownerOrganization.safeUnwrap();
		const organizationMemberId = yield* input.organizationMember.safeUnwrap();
		const { name, githubRepository } = input;

		const project = yield* ApiConvex.v.Project.create({
			input: {
				data: {
					slug: createId(),
					name: name ?? 'Unnamed Project',
					isUnnamed: name === null,
					organization: ownerOrganizationId,
					githubRepository,
				},
				include: getInclude(selection),
			},
		}).safeUnwrap();

		if (
			input.gitlabProject !== null
		) {
			ApiGitlab.linkProject({
				gitlabProjectId: input.gitlabProject.id,
				gitlabProjectName: input.gitlabProject.name,
				organizationMemberId,
				organizationId: ownerOrganizationId,
				projectId: project._id,
			}).safeUnwrap();
		}

		return ok(project);
	})),
	error: ({ error }) => new ProcedureError("Couldn't create project", error),
}));

export const project_create = buildProjectCreateProcedure({});
export const project_create$organizationAndMembersData =
	buildProjectCreateProcedure(
		Project_$organizationAndMembersData,
	);
export const project_create$dashboardPageData = buildProjectCreateProcedure(
	Project_$dashboardPageData,
);

const buildGetProcedure = <$Selection extends Selection | EmptyObject>(
	selection: $Selection,
) => (defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.object({
			project: WebappApiInput.project({
				actor,
				actorOrganizationMemberRole: OrganizationMemberRoleInput.guestOrHigher,
			})(input, ctx),
		})),
	query: async ({ input }) => ($try(async function*() {
		const projectId = yield* input.project.safeUnwrap();
		return ApiConvex.v.Project.get({
			from: { id: projectId },
			include: getInclude(selection),
		});
	})),
	error: ({ error }) => new ProcedureError("Couldn't get project", error),
}));

export const project_get = buildGetProcedure({});
export const project_get$organizationData = buildGetProcedure(
	Project_$organizationData,
);

const buildListProcedure = <$Selection extends Selection | EmptyObject>(
	selection: $Selection,
) => (defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.union([
			z.object({
				organizationMember: WebappApiInput.organizationMember({
					actor,
					actorRelation: 'actor',
					actorOrganizationMemberRole:
						OrganizationMemberRoleInput.guestOrHigher,
				})(input, ctx),
			}),
			z.object({
				user: WebappApiInput.user({
					actor,
					actorRelation: 'actor',
				})(input, ctx),
			}),
			z.object({
				githubRepositoryId: z.string(),
			}),
		])),
	query: async ({ input }) => ($try(async function*() {
		switch (true) {
			case 'organizationMember' in input: {
				const organizationMemberId = yield* input.organizationMember
					.safeUnwrap();
				const { page } = yield* ApiConvex.v.Project.list({
					include: getInclude(selection),
					where: {
						organizationMember: organizationMemberId,
					},
					paginationOpts: {
						cursor: null,
						numItems: 100,
					},
				}).safeUnwrap();
				return ok(page);
			}

			case 'user' in input: {
				const userId = yield* input.user.safeUnwrap();
				const { page } = yield* ApiConvex.v.Project.list({
					include: getInclude(selection),
					where: {
						user: userId,
					},
					paginationOpts: {
						cursor: null,
						numItems: 100,
					},
				}).safeUnwrap();
				return ok(page);
			}

			case 'githubRepositoryId' in input: {
				const { page } = yield* ApiConvex.v.Project.list({
					include: getInclude(selection),
					where: {
						githubRepositoryId: Number(input.githubRepositoryId),
					},
					paginationOpts: {
						cursor: null,
						numItems: 100,
					},
				}).safeUnwrap();
				return ok(page);
			}

			default: {
				return unreachableCase(
					input,
					`Invalid input: ${JSON.stringify(input)}`,
				);
			}
		}
	})),
	error: ({ error }) => new ProcedureError("Couldn't list projects", error),
}));

export const project_list = buildListProcedure({});
export const project_list$organizationData = buildListProcedure(
	Project_$organizationData,
);

export const project_update = defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.object({
			project: WebappApiInput.project({
				actor,
				actorOrganizationMemberRole: OrganizationMemberRoleInput.memberOrHigher,
			})(input, ctx),
			updates: z.object({
				name: z.string().optional(),
				githubRepository: z
					.object({
						id: z.number(),
						url: z.string(),
						git_url: z.string(),
						html_url: z.string(),
						full_name: z.string(),
					})
					.nullable()
					.optional(),
				slackChannel: slackChannelSchema.nullable().optional(),
				isSessionRecordingEnabled: z.boolean().optional(),
				isAutoScreenshotEnabled: z.boolean().optional(),
				jiraSettings: jiraSettingsSchema.nullable().optional(),
				linearSettings: linearSettingsSchema.nullable().optional(),
				asanaSettings: asanaSettingsSchema.nullable().optional(),
				shouldLinkGithubRepository: z.boolean().optional(),
			}),
		})),
	mutation: async ({ input }) => ($try(async function*() {
		const projectId = yield* input.project.safeUnwrap();
		return ApiConvex.v.Project.update({
			input: {
				id: projectId,
				updates: input.updates,
			},
		});
	})),
	error: ({ error }) => new ProcedureError("Couldn't update project", error),
});

export const project_delete = defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.object({
			project: WebappApiInput.project({
				actor,
				actorOrganizationMemberRole: OrganizationMemberRoleInput.memberOrHigher,
			})(input, ctx),
		})),
	mutation: async ({ input }) => ($try(async function*() {
		const projectId = yield* input.project.safeUnwrap();
		return ApiConvex.v.Project.delete({ input: { id: projectId } });
	})),
	error: ({ error }) => new ProcedureError("Couldn't delete project", error),
});
