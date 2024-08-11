import { jiraMember } from '#constants/jira.ts';
import { registerJiraPageMocks } from '#mocks/jira.ts';
import { defineTest } from '#utils/test.ts';
import { defineTestFixtures } from '@-/database-test-fixtures';
import { expect } from 'playwright/test';

const getFixtures = defineTestFixtures(
	'jira-integration-automatic-comment',
	({ authSession }) => ({
		user: {
			type: 'User',
			authSession: authSession.actor(),
		},
		organization: {
			type: 'Organization',
			subscriptionPlan: 'team',
			ownerUser: 'user',
			createOwnerOrganizationMember: false,
		},
		organizationMember: {
			type: 'OrganizationMember',
			user: 'user',
			organization: 'organization',
			role: 'owner',
			jiraMember,
		},
		project: {
			type: 'Project',
			ownerOrganization: 'organization',
		},
	}),
);

const test = defineTest({
	async getState(args) {
		const { routeMockFunctions } = await registerJiraPageMocks(args.page);
		return {
			routeMockFunctions,
			fixtures: await getFixtures(args),
		};
	},
});

test.fixme('automatically creating a jira issue from a comment', async ({ state, page }) => {
	const { organization, project } = state.fixtures;

	// Configuring Jira to automatically create issues
	await page.goto(`https://tunnel.test/${organization.slug}/profile/jira`);
	await page.locator('button').filter({ hasText: 'Select project' })
		.click();
	await page.getByRole('option', { name: 'My Kanban Project' }).click();
	await page.locator('button').filter({ hasText: 'Select issue type' })
		.click();
	await page.getByRole('option', { name: 'Task' }).click();
	await page.getByRole('switch').click();

	await page.goto(
		`https://tunnel.test/${organization.slug}/projects/${project.slug}`,
	);
	await page
		.locator('.ProseMirror')
		.filter({ has: page.locator('[data-placeholder="Write something ..."]') })
		.pressSequentially('This comment should create a Jira Issue');
	await page.getByRole('button', { name: 'Create', exact: true }).click();

	await expect(
		page.locator('a[href^="https://tunnel.atlassian.net/browse/"]'),
	).toBeVisible();
});
