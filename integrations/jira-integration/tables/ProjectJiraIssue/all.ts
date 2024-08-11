import { defineSelection } from '@-/database/selection-utils';

export const ProjectJiraIssue_$all = defineSelection(
	'ProjectJiraIssue',
	() => ({
		labels: true,
	}),
);
