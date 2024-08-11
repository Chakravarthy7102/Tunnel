import { defineSelection } from '@-/database/selection-utils';

export const OrganizationMember_$dashboardPageData = defineSelection(
	'OrganizationMember',
	() => ({
		user: true,
		organization: true,
		authorizedProjectRelations: true,
		linkedGitlabAccount: true,
	}),
);
