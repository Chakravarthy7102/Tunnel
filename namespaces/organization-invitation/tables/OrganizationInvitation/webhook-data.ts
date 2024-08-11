import { defineSelection, getInclude } from '@-/database/selection-utils';
import {
	Organization_$webhookData,
	OrganizationMember_$webhookData,
	User_$webhookData,
} from '@-/database/selections';

export const OrganizationInvitation_$webhookData = defineSelection(
	'OrganizationInvitation',
	() => ({
		organization: {
			include: getInclude(Organization_$webhookData),
		},
		recipientUser: {
			include: getInclude(User_$webhookData),
		},
		senderOrganizationMember: {
			include: getInclude(OrganizationMember_$webhookData),
		},
	}),
);
