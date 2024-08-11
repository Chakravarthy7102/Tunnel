import { WebappApiInput } from '#api-input';
import { defineProcedure } from '#utils/procedure.ts';
import { ApiConvex } from '@-/convex/api';
import { ProcedureError } from '@-/errors';
import { OrganizationMemberRoleInput } from '@-/organization-member';
import { z } from '@-/zod';
import { $try } from 'errok';

export const organization_transferOwnership = defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.object({
			oldOwnerOrganizationMember: WebappApiInput.organizationMember({
				actor,
				actorRelation: 'actor',
				actorOrganizationMemberRole: OrganizationMemberRoleInput.ownerOnly,
			})(input, ctx),
			newOwnerOrganizationMember: WebappApiInput.organizationMember({
				actor,
				actorRelation: 'notActor',
				actorOrganizationMemberRole: OrganizationMemberRoleInput.ownerOnly,
				targetOrganizationMemberRole: OrganizationMemberRoleInput.notOwner,
			})(input, ctx),
		})),
	mutation: async ({ input }) => ($try(async function*() {
		const oldOwnerOrganizationMemberId = yield* input
			.oldOwnerOrganizationMember
			.safeUnwrap();
		const newOwnerOrganizationMemberId = yield* input
			.newOwnerOrganizationMember
			.safeUnwrap();
		return ApiConvex.v.Organization.transferOwnership({
			input: {
				oldOwnerOrganizationMember: oldOwnerOrganizationMemberId,
				newOwnerOrganizationMember: newOwnerOrganizationMemberId,
			},
		});
	})),
	error: ({ error }) =>
		new ProcedureError("Couldn't transfer organization ownership", error),
});
