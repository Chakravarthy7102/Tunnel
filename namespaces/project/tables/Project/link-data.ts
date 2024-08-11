import { defineSelection } from '@-/database/selection-utils';

export const Project_$linkData = defineSelection('Project', () => ({
	organization: true,
	members: {
		include: {
			user: true,
		},
	},
}));
