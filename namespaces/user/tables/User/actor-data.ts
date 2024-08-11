import { defineSelection } from '@-/database/selection-utils';

export const User_$profileData = defineSelection('User', () => ({}));
export const User_$organizationMembersData = defineSelection(
	'User',
	() => ({
		organizationMemberships: {
			include: {
				organization: true,
			},
		},
	}),
);
