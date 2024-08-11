import { defineTest } from '#utils/test.ts';
import { defineTestFixtures } from '@-/database-test-fixtures';
import type { Page } from 'playwright';

export const getFixtures = defineTestFixtures(
	'dashboard-filters-jira',
	({ authSession }) => ({
		user: {
			type: 'User',
			authSession: authSession.actor(),
		},
		organization: {
			type: 'Organization',
			ownerUser: 'user',
		},
		project: {
			type: 'Project',
			ownerOrganization: 'organization',
		},
		projectCommentThread: {
			type: 'ProjectCommentThread',
			project: 'project',
			authorUser: 'user',
		},
	}),
);

const test = defineTest({
	async getState(args) {
		return {
			fixtures: await getFixtures(args),
		};
	},
});

async function testJiraFilter(
	{ pageUrl, page }: { pageUrl: string; page: Page },
) {
	const jiraFilters = {
		oneOfJiraIssueAssigneeAccountIds: {
			singular: 'Jira Assignee',
			plural: 'assignees',
			dropdownLabel: 'Assignee',
		},
		oneOfJiraIssueKeys: {
			plural: 'keys',
			singular: 'Jira Key',
			dropdownLabel: 'Key',
		},
		oneOfJiraIssueProjectIds: {
			plural: 'projects',
			singular: 'Jira Project',
			dropdownLabel: 'Project',
		},
		oneOfJiraIssueTypeIds: {
			plural: 'issue types',
			singular: 'Jira Issue Type',
			dropdownLabel: 'Issue Type',
		},
	};

	await Promise.all(
		Object.entries(jiraFilters).map(
			async ([_filterKey, { dropdownLabel }]) => {
				await page.goto(pageUrl);
				await page.getByRole('button', { name: 'Filter threads' }).click();
				await page.getByRole('button', { name: 'Jira' }).click();
				await page.getByRole('button', { name: dropdownLabel }).click();
			},
		),
	);
}

test.fixme('jira filters work on the organization page', async ({ state, page }) => {
	const { organization } = state.fixtures;
	await testJiraFilter({
		page,
		pageUrl: `https://tunnel.test/${organization.slug}`,
	});
});

test.fixme('jira filters work on the project page', async ({ state, page }) => {
	const { project, organization } = state.fixtures;
	await testJiraFilter({
		page,
		pageUrl:
			`https://tunnel.test/${organization.slug}/projects/${project.slug}`,
	});
});
