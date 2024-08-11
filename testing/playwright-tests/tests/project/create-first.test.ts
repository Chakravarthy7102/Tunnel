import { defineTest } from '#utils/test.ts';
import { defineTestFixtures } from '@-/database-test-fixtures';
import { expect } from 'playwright/test';

export const getFixtures = defineTestFixtures(
	'project-create-first',
	({ authSession }) => ({
		user: {
			type: 'User',
			authSession: authSession.actor(),
		},
		organization: {
			type: 'Organization',
			ownerUser: 'user',
			name: 'My Organization',
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

// FIXME
test.fixme('creating a new project for the first time', async ({ page, state }) => {
	const { organization } = state.fixtures;

	await page.goto(`https://tunnel.test/${organization.slug}/projects`, {
		waitUntil: 'networkidle',
	});
	await page.getByRole('button', { name: 'New Project' }).click();
	await page.getByLabel('Project Name').fill('My New Project');
	await page.getByRole('button', { name: 'Create' }).click();

	await expect(page).toHaveURL(
		new RegExp(`https://tunnel.test/${organization.slug}/projects/`),
	);
});
