import type {
	createdJiraIssueSchema,
	jiraAssigneeSchema,
	jiraFormSchema,
	jiraIssueTypeSchema,
	jiraParentIssueSchema,
	jiraProjectSchema,
	jiraSettingsSchema,
} from '#schemas/jira.ts';
import type { createJiraFilterChoicesMaps } from '#utils/filter.ts';
import type { jiraOrganizationValidator } from '#validators/jira.ts';
import type { Infer } from '@-/convex/values';
import type { z } from '@-/zod';
import type { OrderedMap } from 'js-sdsl';

export type JiraFilterChoices = {
	[$Key in keyof ReturnType<typeof createJiraFilterChoicesMaps>]: ReturnType<
		typeof createJiraFilterChoicesMaps
	>[$Key] extends OrderedMap<string, infer $Value> ? Record<string, $Value> :
		never;
};

export type JiraProject = z.infer<typeof jiraProjectSchema>;
export type JiraIssueType = z.infer<typeof jiraIssueTypeSchema>;
export type JiraAssignee = z.infer<typeof jiraAssigneeSchema>;
export type JiraParentIssue = z.infer<typeof jiraParentIssueSchema>;
export type CreatedJiraIssue = z.infer<typeof createdJiraIssueSchema>;
export type JiraForm = z.infer<typeof jiraFormSchema>;
export type JiraOrganization = Infer<typeof jiraOrganizationValidator>;
export type JiraSettings = z.infer<typeof jiraSettingsSchema>;
