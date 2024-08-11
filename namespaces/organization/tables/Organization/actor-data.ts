import { defineSelection } from '@-/database/selection-utils';

export const Organization_$memberProfileData = defineSelection(
	'Organization',
	() => ({
		jiraOrganization: true,
		linearOrganization: true,
		slackOrganization: true,
		asanaOrganization: true,
	}),
);
