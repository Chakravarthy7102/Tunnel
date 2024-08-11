import { registerRouteMocks } from '#utils/route.ts';
import type { CreatedJiraIssue } from '@-/integrations';
import type { Version3Models } from 'jira';
import type { Page } from 'playwright';

export async function registerJiraPageMocks(page: Page) {
	const routeMockFunctions = await registerRouteMocks(page, {
		'https://tunnel.test/api/trpc/*': {
			async 'GET /jira.getProjects'(): Promise<
				Version3Models.PageProject
			> {
				return {
					isLast: true,
					maxResults: 1,
					self: '',
					startAt: 0,
					total: 1,
					values: [
						{
							id: '',
							key: '',
							lead: null!,
							name: 'My Kanban Project',
							avatarUrls: {
								'16x16': '',
								'24x24': '',
								'32x32': '',
								'48x48': '',
							},
						},
					],
				};
			},
			async 'GET /jira.getProjectIssueTypes'(): Promise<
				Version3Models.IssueTypeDetails[]
			> {
				return [
					{
						description: '',
						iconUrl: '',
						id: '',
						name: 'Task',
						self: '',
						subtask: false,
					},
				];
			},
			async 'GET /jira.getLabels'(): Promise<
				Version3Models.PageString
			> {
				return {
					values: ['Label 1'],
				};
			},
			async 'GET /jira.getIssue'(): Promise<
				Version3Models.IssuePickerSuggestions
			> {
				return {
					sections: [{
						issues: [],
					}],
				};
			},
			async 'GET /jira.getUsers'(): Promise<
				Version3Models.FoundUsersAndGroups
			> {
				return {
					groups: {},
					users: {},
				};
			},
			async 'POST /jira.createIssue'(): Promise<CreatedJiraIssue> {
				return {
					id: 'issueid',
					key: 'KAN-1',
					self: 'https://tunnel.atlassian.net/',
					url: 'https://tunnel.atlassian.net/browse/KAN-1',
					project: { id: '', key: '', name: '', avatarUrl: '' },
					assignee: { accountId: '', avatarUrl: '', displayName: '' },
					issueType: { iconUrl: '', id: '', name: '', subtask: false },
					parentIssue: { id: '', key: '', summary: '' },
					labels: [],
				};
			},
		},
	});

	return { routeMockFunctions };
}
