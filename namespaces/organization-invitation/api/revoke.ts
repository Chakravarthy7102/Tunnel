import { ApiConvex } from '@-/convex/api';
import type { Id } from '@-/database';
import { $try, ok } from 'errok';

export const ApiOrganizationInvitation_revoke = ({
	organizationInvitationId,
}: {
	organizationInvitationId: Id<'OrganizationInvitation'>;
}) => ($try(async function*() {
	yield* ApiConvex.v.OrganizationInvitation.delete({
		input: { id: organizationInvitationId },
	}).safeUnwrap();

	return ok();
}));
