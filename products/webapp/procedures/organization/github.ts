import { WebappApiInput } from '#api-input';
import { defineProcedure } from '#utils/procedure.ts';
import { ProcedureError } from '@-/errors';
import { ApiGithub } from '@-/github-integration/api';
import { OrganizationMemberRoleInput } from '@-/organization-member';
import { z } from '@-/zod';
import { $try } from 'errok';

export const organization_listRepositories = defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.object({
			organization: WebappApiInput.organization({
				actor,
				actorOrganizationMemberRole: OrganizationMemberRoleInput.memberOrHigher,
				plans: 'any',
			})(input, ctx),
		})),
	query: async ({ input }) => ($try(async function*() {
		const organizationId = yield* input.organization.safeUnwrap();
		return ApiGithub.listRepositories({
			organizationId,
		});
	})),
	error: ({ error }) =>
		new ProcedureError(
			"Couldn't list organization's GitHub repositories",
			error,
		),
});

export const organization_getRepository = defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.object({
			organization: WebappApiInput.organization({
				actor,
				actorOrganizationMemberRole: OrganizationMemberRoleInput.memberOrHigher,
				plans: 'any',
			})(input, ctx),
			owner: z.string(),
			repo: z.string(),
		})),
	query: async ({ input }) => ($try(async function*() {
		const organizationId = yield* input.organization.safeUnwrap();
		return ApiGithub.getRepository({
			organizationId,
			owner: input.owner,
			repo: input.repo,
		});
	})),
	error: ({ error, input: { owner, repo } }) =>
		new ProcedureError(
			`Couldn't get GitHub repository (${owner}/${repo})`,
			error,
		),
});
