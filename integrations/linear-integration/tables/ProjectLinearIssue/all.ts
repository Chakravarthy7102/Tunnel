import { defineSelection } from '@-/database/selection-utils';

export const ProjectLinearIssue_$all = defineSelection(
	'ProjectLinearIssue',
	() => ({
		labels: true,
	}),
);
