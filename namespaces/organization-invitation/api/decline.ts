import { ApiConvex } from '@-/convex/api';
import type { Id } from '@-/database';
import { $try, ok } from 'errok';

export const ApiOrganizationInvitation_decline = ({
	organizationInvitationId,
}: {
	organizationInvitationId: Id<'OrganizationInvitation'>;
}) => ($try(async function*() {
	yield* ApiConvex.v.OrganizationInvitation.update({
		input: {
			id: organizationInvitationId,
			updates: { status: 'declined' },
		},
	}).safeUnwrap();

	return ok();
}));
