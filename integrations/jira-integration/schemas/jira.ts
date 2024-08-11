import { z } from '@-/zod';

export const jiraIssueTypeSchema = z.object({
	id: z.string(),
	iconUrl: z.string(),
	name: z.string(),
	subtask: z.boolean(),
});

export const jiraAssigneeSchema = z.object({
	accountId: z.string(),
	avatarUrl: z.string(),
	displayName: z.string(),
});

export const jiraParentIssueSchema = z.object({
	id: z.string(),
	summary: z.string(),
	key: z.string(),
});

export const jiraProjectSchema = z.object({
	id: z.string(),
	key: z.string(),
	avatarUrl: z.string(),
	name: z.string(),
});

export const jiraFormSchema = z.object({
	title: z.string().nullable().optional(),
	project: jiraProjectSchema.nullable(),
	assignee: jiraAssigneeSchema.nullable(),
	issueType: jiraIssueTypeSchema.nullable(),
	labels: z.array(z.string()),
});

export const jiraOrganizationSchema = z.object({
	webTriggerUrl: z.string().nullable().optional(),
	default: jiraFormSchema.nullable(),
	createAutomatically: z.boolean(),
	url: z.string().nullable(),
});

export const createdJiraIssueSchema = z.object({
	id: z.string(),
	key: z.string(),
	self: z.string(),
	url: z.string(),
	project: jiraProjectSchema,
	assignee: jiraAssigneeSchema.nullable(),
	issueType: jiraIssueTypeSchema.nullable(),
	parentIssue: jiraParentIssueSchema.nullable(),
	labels: z.array(z.string()),
});

export const jiraSettingsSchema = z.object({
	default: jiraFormSchema.nullable(),
	createAutomatically: z.boolean(),
});
