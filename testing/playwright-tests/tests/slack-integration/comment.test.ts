import { defineTest } from '#utils/test.ts';
import { defineTestFixtures } from '@-/database-test-fixtures';
import { expect } from 'playwright/test';

const getFixtures = defineTestFixtures(
	'slack-integration-comment',
	({ authSession }) => ({
		user: {
			type: 'User',
			authSession: authSession.actor(),
		},
		organization: {
			type: 'Organization',
			ownerUser: 'user',
			createOwnerOrganizationMember: false,
			subscriptionPlan: 'team',
		},
		organizationMember: {
			type: 'OrganizationMember',
			user: 'user',
			role: 'owner',
			organization: 'organization',
		},
		project: {
			type: 'Project',
			identifier: 'proj',
			ownerOrganization: 'organization',
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

test.fixme('automatically creates a slack message from a comment', async ({ state, page }) => {
	const { organization, project } = state.fixtures;
	await page.goto(
		`https://tunnel.test/${organization.slug}/projects/${project.slug}`,
	);
	await page
		.locator('.ProseMirror')
		.filter({ has: page.locator('[data-placeholder="Write something ..."]') })
		.pressSequentially('This comment should create a Slack Issue');
	await page.getByTestId('integration-dialog-trigger').click();
	await page.getByRole('button', { name: 'Create broadcast' }).click();
	await page.getByRole('combobox', { name: 'Select channel' }).click();
	await page.getByRole('option', { name: 'slack-testing' }).click();
	await page.getByRole('button', { name: 'Save' }).click();
	await page.getByRole('button', { name: 'Create' }).click();
	await expect(
		page.locator('a[href^="https://tunnel-labs.slack.com/archives/"]'),
	).toBeVisible();
});
