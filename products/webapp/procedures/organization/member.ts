import { WebappApiInput } from '#api-input';
import { defineProcedure } from '#utils/procedure.ts';
import { ApiConvex } from '@-/convex/api';
import { ProcedureError } from '@-/errors';
import { OrganizationMemberRoleInput } from '@-/organization-member';
import { z } from '@-/zod';
import { $try, ok } from 'errok';

export const organization_listMembers = defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.object({
			organization: WebappApiInput.organization({
				actor,
				actorOrganizationMemberRole: OrganizationMemberRoleInput.memberOrHigher,
				plans: 'any',
			})(input, ctx),
			includeProjectGuests: z.boolean(),
		})),
	query: async ({ input }) => ($try(async function*() {
		const organizationId = yield* input.organization.safeUnwrap();
		const { page } = yield* ApiConvex.v.OrganizationMember.list({
			where: {
				organization: organizationId,
				includeProjectGuests: input.includeProjectGuests,
			},
			include: { user: true },
			paginationOpts: {
				cursor: null,
				numItems: 100,
			},
		}).safeUnwrap();
		return ok(page);
	})),
	error: ({ error }) =>
		new ProcedureError("Couldn't list organization members", error),
});
