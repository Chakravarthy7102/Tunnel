import { ApiGitlab } from '#api';
import { ProcedureError } from '@-/errors';
import { WebappApiInput } from '@-/webapp/api-input';
import { z } from '@-/zod';
import { $try } from 'errok';
// eslint-disable-next-line @tunnel/no-relative-import-paths/no-relative-import-paths -- This breaks Next.js builds for some reason
import { defineProcedure } from '../../../products/webapp/exports/procedure-utils.ts';

export const gitlab_listProjects = defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.object({
			organizationMember: WebappApiInput.organizationMember({
				actor,
				actorOrganizationMemberRole: {
					admin: true,
					guest: true,
					member: true,
					owner: true,
				},
				actorRelation: 'actor',
			})(input, ctx),
		})),
	query: async ({ input }) => ($try(async function*() {
		const organizationMemberId = yield* input.organizationMember.safeUnwrap();
		return ApiGitlab.listProjects({
			organizationMemberId,
		});
	})),
	error: ({ error }) =>
		new ProcedureError(
			"Couldn't list organization member's GitLab projects",
			error,
		),
});

export const gitlab_linkProject = defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.object({
			project: WebappApiInput.project({
				actor,
				actorOrganizationMemberRole: {
					admin: true,
					guest: false,
					member: true,
					owner: true,
				},
			})(input, ctx),
			organizationMember: WebappApiInput.organizationMember({
				actor,
				actorRelation: 'actor',
				actorOrganizationMemberRole: {
					admin: true,
					guest: false,
					member: true,
					owner: true,
				},
			})(input, ctx),
			organization: WebappApiInput.organization({
				actor,
				actorOrganizationMemberRole: {
					admin: true,
					guest: false,
					member: true,
					owner: true,
				},
				plans: 'any',
			})(input, ctx),
			gitlabProjectId: z.number(),
			gitlabProjectName: z.string(),
		})),
	mutation: async ({ input }) => ($try(async function*() {
		const projectId = yield* input.project.safeUnwrap();
		const organizationMemberId = yield* input.organizationMember.safeUnwrap();
		const organizationId = yield* input.organization.safeUnwrap();

		return ApiGitlab.linkProject({
			gitlabProjectId: input.gitlabProjectId,
			gitlabProjectName: input.gitlabProjectName,
			projectId,
			organizationMemberId,
			organizationId,
		});
	})),
	error: ({ error }) =>
		new ProcedureError(
			"Couldn't link GitLab project to Tunnel project",
			error,
		),
});

export const gitlab_unlinkProject = defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.object({
			project: WebappApiInput.project({
				actor,
				actorOrganizationMemberRole: {
					admin: true,
					guest: false,
					member: true,
					owner: true,
				},
			})(input, ctx),
		})),
	mutation: async ({ input }) => ($try(async function*() {
		const projectId = yield* input.project.safeUnwrap();
		return ApiGitlab.unlinkProject({ projectId });
	})),
	error: ({ error }) =>
		new ProcedureError(
			"Couldn't link GitLab project to Tunnel project",
			error,
		),
});
