import { defineSelection } from '@-/database/selection-utils';

export const Project_$organizationData = defineSelection(
	'Project',
	() => ({ organization: true }),
);
