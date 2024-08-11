import { defineSelection } from '@-/database/selection-utils';

export const Project_$organizationAndMembersData = defineSelection(
	'Project',
	() => ({
		organization: true,
		members: {
			include: {
				user: true,
				project: true,
			},
		},
	}),
);
