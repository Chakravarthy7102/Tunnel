import { z } from '@-/zod';

/**
	If multiple fields are specified, it should be the intersection type (AND) between them.

	Arrays that include `null` means to include all items that have no value for that field (e.g. no assignees).
*/
export const projectCommentThreadFiltersSelectionSchema = z.object({
	// Linear issue filters
	oneOfLinearIssueTeamIds: z.array(z.string().nullable()),
	oneOfLinearIssueProjectIds: z.array(z.string().nullable()),
	oneOfLinearIssuePriorityLabels: z.array(z.string().nullable()),
	oneOfLinearIssueStatusIds: z.array(z.string().nullable()),
	oneOfLinearIssueAssigneeIds: z.array(z.string().nullable()),
	oneOfLinearIssueIdentifiers: z.array(z.string()),
	allOfLinearIssueLabelIds: z.array(z.string()),

	// Jira issue
	oneOfJiraIssueProjectIds: z.array(z.string().nullable()),
	oneOfJiraIssueTypeIds: z.array(z.string().nullable()),
	oneOfJiraIssueAssigneeAccountIds: z.array(z.string().nullable()),
	oneOfJiraIssueKeys: z.array(z.string()),
	allOfJiraLabels: z.array(z.string()),

	// Tunnel properties
	oneOfAuthorUserIds: z.array(z.string()),
	oneOfProjectIds: z.array(z.string()),

	oneOfStatus: z.array(z.enum(['resolved', 'unresolved'])),
});
