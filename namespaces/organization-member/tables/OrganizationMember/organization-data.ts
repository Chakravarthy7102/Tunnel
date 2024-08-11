import { defineSelection } from '@-/database/selection-utils';

export const OrganizationMember_$organizationData = defineSelection(
	'OrganizationMember',
	() => ({ organization: true }),
);
