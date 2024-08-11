import { ApiConvex } from '@-/convex/api';
import type { Id } from '@-/database';
import { ApiOrganization } from '@-/organization/api';
import { $try, ok } from 'errok';

export const ApiOrganizationMember_remove = ({
	organizationMemberId,
}: {
	organizationMemberId: Id<'OrganizationMember'>;
}) => ($try(async function*() {
	const organizationMember = yield* ApiConvex.v.OrganizationMember.get({
		from: {
			id: organizationMemberId,
		},
		include: {
			organization: true,
		},
	}).safeUnwrap();

	// Do nothing if the organization member wasn't found
	if (organizationMember === null) {
		return ok();
	}

	yield* ApiConvex.v.OrganizationMember.delete({
		input: { id: organizationMember._id },
	}).safeUnwrap();

	const { organization } = organizationMember;

	yield* ApiOrganization.updateSubscriptionAmount({
		organizationId: organization._id,
	}).safeUnwrap();

	return ok();
}));
