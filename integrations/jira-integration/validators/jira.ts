import { v } from '@-/convex/values';
import { vDeprecated, vNew, vNullable } from 'corvex';

export const jiraIssueTypeValidator = v.object({
	id: v.string(),
	iconUrl: v.string(),
	name: v.string(),
	subtask: v.boolean(),
});

export const jiraAssigneeValidator = v.object({
	accountId: v.string(),
	avatarUrl: v.string(),
	displayName: v.string(),
});

export const jiraParentIssueValidator = v.object({
	id: v.string(),
	summary: v.string(),
	key: v.string(),
});

export const jiraProjectValidator = v.object({
	id: v.string(),
	key: v.string(),
	avatarUrl: v.string(),
	name: v.string(),
});

export const jiraOrganizationValidator = v.object({
	webTriggerUrl: vNew(vNullable(v.string())),
	access_token: vDeprecated(`use 'webTriggerUrl' instead`),
	refresh_token: vDeprecated(`use 'webTriggerUrl' instead`),
	expires_in: vDeprecated(`use 'webTriggerUrl' instead`),
	created_at: vDeprecated(`use 'webTriggerUrl' instead`),
	cloud_id: vDeprecated(`use 'jiraCloudId' in 'linkedJiraAccount' instead`),
	url: vNullable(v.string()),

	default: vDeprecated('Defaults settings are now in project.jiraSettings'),
	createAutomatically: vDeprecated(
		'Default settings are now in project.jiraSettings',
	),
});

export const jiraSettingsValidator = v.object({
	default: vNullable(
		v.object({
			title: v.optional(vNullable(v.string())),
			project: vNullable(jiraProjectValidator),
			assignee: vNullable(jiraAssigneeValidator),
			issueType: vNullable(jiraIssueTypeValidator),
			labels: v.array(v.string()),
		}),
	),
	createAutomatically: v.boolean(),
});
