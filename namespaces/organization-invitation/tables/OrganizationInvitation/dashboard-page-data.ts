import { defineSelection } from '@-/database/selection-utils';

export const OrganizationInvitation_$dashboardPageData = defineSelection(
	'OrganizationInvitation',
	() => ({
		recipientUser: true,
		organization: true,
		senderOrganizationMember: {
			include: {
				user: true,
			},
		},
		projectRelation: true,
	}),
);
