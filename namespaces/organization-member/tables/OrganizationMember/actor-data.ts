import { defineSelection, getInclude } from '@-/database/selection-utils';
import {
	Organization_$memberProfileData,
} from '@-/database/selections';

export const OrganizationMember_$actorProfileData = defineSelection(
	'OrganizationMember',
	() => ({
		user: true,
		organization: {
			include: getInclude(Organization_$memberProfileData),
		},
		linkedAsanaAccount: true,
		linkedSlackAccount: true,
		linkedLinearAccount: true,
		linkedJiraAccount: true,
		linkedGithubAccount: true,
		linkedGitlabAccount: true,
		authorizedProjectRelations: true,
	}),
);
