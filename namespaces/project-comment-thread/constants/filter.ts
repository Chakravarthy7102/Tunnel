import type { ProjectCommentThreadFiltersSelection } from '#types';

export const emptyFiltersSelection: ProjectCommentThreadFiltersSelection = {
	oneOfLinearIssueTeamIds: [],
	oneOfLinearIssueProjectIds: [],
	oneOfLinearIssuePriorityLabels: [],
	oneOfLinearIssueStatusIds: [],
	oneOfLinearIssueAssigneeIds: [],
	oneOfLinearIssueIdentifiers: [],
	allOfLinearIssueLabelIds: [],
	oneOfJiraIssueProjectIds: [],
	oneOfJiraIssueTypeIds: [],
	oneOfJiraIssueAssigneeAccountIds: [],
	oneOfJiraIssueKeys: [],
	allOfJiraLabels: [],
	oneOfAuthorUserIds: [],
	oneOfProjectIds: [],
	oneOfStatus: [],
};
