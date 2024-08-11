import { defineSelection } from '@-/database/selection-utils';

export const Organization_$dashboardPageData = defineSelection(
	'Organization',
	() => ({
		linearOrganization: true,
		jiraOrganization: true,
		slackOrganization: true,
		asanaOrganization: true,
	}),
);
