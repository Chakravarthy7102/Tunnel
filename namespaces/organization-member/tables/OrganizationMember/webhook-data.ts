import { defineSelection, getInclude } from '@-/database/selection-utils';
import {
	Organization_$webhookData,
	User_$webhookData,
} from '@-/database/selections';

export const OrganizationMember_$webhookData = defineSelection(
	'OrganizationMember',
	() => ({
		user: {
			include: getInclude(User_$webhookData),
		},
		organization: {
			include: getInclude(Organization_$webhookData),
		},
	}),
);
