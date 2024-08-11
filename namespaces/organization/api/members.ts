import { ApiConvex } from '@-/convex/api';
import { type Id } from '@-/database';
import { DocumentNotFoundError } from '@-/errors';
import { $try, err, ok } from 'errok';

export const ApiOrganization_getNumAvailableSpots = (
	{ organizationId }: { organizationId: Id<'Organization'> },
) => ($try(async function*() {
	const organization = yield* ApiConvex.v.Organization.get({
		from: { id: organizationId },
		include: {},
	}).safeUnwrap();

	if (organization === null) {
		return err(new DocumentNotFoundError('Organization'));
	}

	if (organization.subscriptionPlan === 'team') {
		return ok(Number.POSITIVE_INFINITY);
	} else if (organization.subscriptionPlan === 'free') {
		return ok(Number.POSITIVE_INFINITY);
		// return ok(Math.max(0, 3 - organization.membersCount));
	} else {
		return ok(Number.POSITIVE_INFINITY);
	}
}));
