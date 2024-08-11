import { defineSelection } from '@-/database/selection-utils';

export const OrganizationMember_$userData = defineSelection(
	'OrganizationMember',
	() => ({
		user: true,
		authorizedProjectRelations: true,
		linkedGitlabAccount: true,
	}),
);
