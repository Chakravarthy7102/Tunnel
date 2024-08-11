import { defineSelection } from '@-/database/selection-utils';

export const organizationInvitationSelect = defineSelection(
	'OrganizationInvitation',
	() => ({
		organization: true,
		projectRelation: true,
		recipientUser: true,
	}),
);
