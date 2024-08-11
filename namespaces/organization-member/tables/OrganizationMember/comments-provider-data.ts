import { defineSelection } from '@-/database/selection-utils';

export const OrganizationMember_$commentsProviderData = defineSelection(
	'OrganizationMember',
	() => ({
		user: true,
		organization: true,
	}),
);
