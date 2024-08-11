import { WebappApiInput } from '#api-input';
import { defineProcedure } from '#utils/procedure.ts';
import { ApiConvex } from '@-/convex/api';
import { ProcedureError } from '@-/errors';
import { OrganizationMemberRoleInput } from '@-/organization-member';
import { z } from '@-/zod';
import { unreachableCase } from '@tunnel/ts';
import { $try } from 'errok';

export const projectJiraIssue_listFiltersChoices = defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.union([
			z.object({
				organization: WebappApiInput.organization({
					actor,
					actorOrganizationMemberRole:
						OrganizationMemberRoleInput.memberOrHigher,
					plans: 'any',
				})(input, ctx),
			}),
			z.object({
				project: WebappApiInput.project({
					actor,
					actorOrganizationMemberRole:
						OrganizationMemberRoleInput.memberOrHigher,
				})(input, ctx),
			}),
		])),
	query: async ({ input }) => ($try(async function*() {
		switch (true) {
			case 'organization' in input: {
				const organizationId = yield* input.organization.safeUnwrap();
				return ApiConvex.v.ProjectJiraIssue.listFiltersChoices({
					input: {
						organization: organizationId,
					},
				});
			}

			case 'project' in input: {
				const projectId = yield* input.project.safeUnwrap();
				return ApiConvex.v.ProjectJiraIssue.listFiltersChoices({
					input: {
						project: projectId,
					},
				});
			}

			default: {
				return unreachableCase(
					input,
					`Invalid input: ${JSON.stringify(input)}`,
				);
			}
		}
	})),
	error: ({ error }) => new ProcedureError("Couldn't list Jira filters", error),
});
