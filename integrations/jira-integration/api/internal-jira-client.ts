import type { IssuePickerSuggestions } from 'jira/out/version2/models/issuePickerSuggestions.js';
import type { Attachment } from 'jira/out/version3/models/attachment.js';
import type { CreatedIssue } from 'jira/out/version3/models/createdIssue.js';
import type { FoundUsersAndGroups } from 'jira/out/version3/models/foundUsersAndGroups.js';
import type { IssueTypeDetails } from 'jira/out/version3/models/issueTypeDetails.js';
import type { PageProject } from 'jira/out/version3/models/pageProject.js';
import type { PageString } from 'jira/out/version3/models/pageString.js';
import type { Transitions } from 'jira/out/version3/models/transitions.js';

const fetchTrigger = async <_T>(
	webTriggerUrl: string,
	body: { type: string; payload?: Record<string, any> },
) => {
	return fetch(webTriggerUrl, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(body),
	});
};

export const Version3InternalClient = (
	{ webTriggerUrl }: { webTriggerUrl: string },
) => {
	return {
		issues: {
			async createIssue(payload: Record<string, any>): Promise<CreatedIssue> {
				return fetchTrigger(webTriggerUrl, {
					type: 'createIssue',
					payload,
				}).then(async (res) => res.json());
			},
			async getTransitions(payload: Record<string, any>): Promise<Transitions> {
				const { transitions } = await fetchTrigger(
					webTriggerUrl,
					{
						type: 'getTransitions',
						payload,
					},
				).then(async (res) => res.json());

				return { transitions };
			},
			async doTransition(payload: Record<string, any>): Promise<void> {
				await fetchTrigger(webTriggerUrl, {
					type: 'doTransition',
					payload,
				});
			},
			async deleteIssue(payload: Record<string, any>): Promise<void> {
				await fetchTrigger(webTriggerUrl, {
					type: 'deleteIssue',
					payload,
				}).then(async (res) => res.text());
			},
		},
		issueAttachments: {
			async addAttachment(payload: Record<string, any>) {
				const attachmentDataUrls = await Promise.all(
					[payload.attachment].map(async (attachment) => {
						const file = await attachment.file;

						return {
							filename: attachment.filename,
							dataUrl: `data:${file.type};base64,${
								Buffer.from(await file.arrayBuffer()).toString('base64')
							}`,
						};
					}),
				);

				await fetchTrigger<Promise<Attachment[]>>(webTriggerUrl, {
					type: 'addAttachment',
					payload: {
						attachmentDataUrls,
						issueIdOrKey: payload.issueIdOrKey,
					},
				});
			},
		},
		projects: {
			async searchProjects(): Promise<PageProject> {
				return fetchTrigger(webTriggerUrl, {
					type: 'searchProjects',
				}).then(async (res) => res.json());
			},
		},
		issueTypes: {
			async getIssueTypesForProject(
				payload: Record<string, any>,
			): Promise<IssueTypeDetails[]> {
				return fetchTrigger(webTriggerUrl, {
					type: 'getIssueTypesForProject',
					payload,
				}).then(async (res) => res.json());
			},
		},
		labels: {
			async getAllLabels(): Promise<PageString> {
				return fetchTrigger(webTriggerUrl, {
					type: 'getAllLabels',
				}).then(async (res) => res.json());
			},
		},
		groupAndUserPicker: {
			async findUsersAndGroups(
				payload: Record<string, any>,
			): Promise<FoundUsersAndGroups> {
				return fetchTrigger(webTriggerUrl, {
					type: 'findUsersAndGroups',
					payload,
				}).then(async (res) => res.json());
			},
		},
		issueSearch: {
			async getIssuePickerResource(
				payload: Record<string, any>,
			): Promise<IssuePickerSuggestions> {
				return fetchTrigger(webTriggerUrl, {
					type: 'getIssuePickerResource',
					payload,
				}).then(async (res) => res.json());
			},
		},
	};
};
