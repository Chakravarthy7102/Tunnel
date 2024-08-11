import { ApiConvex } from '@-/convex/api';
import type { Id } from '@-/database';

export const ApiOrganization_deactivate = (
	{ organizationId }: { organizationId: Id<'Organization'> },
) => (ApiConvex.v.Organization.update({
	input: {
		id: organizationId,
		updates: {
			subscriptionPlan: 'free',
		},
	},
}));
