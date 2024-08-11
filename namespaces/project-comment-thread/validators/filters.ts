import { v } from '@-/convex/values';
import { vNullable } from 'corvex';

/**
	Should be used with a validator object containing the project or the organization.
	@example ```js
		v.object({
			organization: v.id('Organization'),
			...projectCommentThreadSearchValidators
		})
	```
*/
export const projectCommentThreadFiltersValidator = v.object({
	oneOfLinearIssueTeamIds: v.array(vNullable(v.string())),
	oneOfLinearIssueProjectIds: v.array(vNullable(v.string())),
	oneOfLinearIssuePriorityLabels: v.array(vNullable(v.string())),
	oneOfLinearIssueStatusIds: v.array(vNullable(v.string())),
	oneOfLinearIssueAssigneeIds: v.array(vNullable(v.string())),
	oneOfLinearIssueIdentifiers: v.array(v.string()),
	allOfLinearIssueLabelIds: v.array(v.string()),

	oneOfJiraIssueProjectIds: v.array(vNullable(v.string())),
	oneOfJiraIssueTypeIds: v.array(vNullable(v.string())),
	oneOfJiraIssueAssigneeAccountIds: v.array(vNullable(v.string())),
	oneOfJiraIssueKeys: v.array(v.string()),
	allOfJiraLabels: v.array(v.string()),

	oneOfAuthorUserIds: v.array(v.string()),
	oneOfProjectIds: v.array(v.string()),
	oneOfStatus: v.array(
		v.union(v.literal('resolved'), v.literal('unresolved')),
	),
});
