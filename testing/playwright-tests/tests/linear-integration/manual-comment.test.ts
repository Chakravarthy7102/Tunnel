import { linearMember } from '#constants/linear.ts';
import { registerLinearPageMocks } from '#mocks/linear.ts';
import { defineTest } from '#utils/test.ts';
import { defineTestFixtures } from '@-/database-test-fixtures';
import { expect } from 'playwright/test';

export const getFixtures = defineTestFixtures(
	'linear-integration-manual-comment',
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
			linearMember,
		},
		project: {
			type: 'Project',
			ownerOrganization: 'organization',
		},
	}),
);

const test = defineTest({
	async getState(args) {
		const { routeMockFunctions } = await registerLinearPageMocks(args.page);
		return {
			routeMockFunctions,
			fixtures: await getFixtures(args),
		};
	},
});

test.fixme('manually creating a linear issue from a comment', async ({ state, page }) => {
	const {
		organization,
		project,
	} = state.fixtures;

	await page.goto(
		`https://tunnel.test/${organization.slug}/projects/${project.slug}`,
	);
	await page
		.locator('.ProseMirror')
		.filter({ has: page.locator('[data-placeholder="Write something ..."]') })
		.pressSequentially('This comment should create a Linear Issue');
	await page.getByTestId('integration-dialog-trigger').click();
	await page.getByRole('button', { name: 'Create issue' }).click();
	await page.getByRole('combobox', { name: 'Select team' }).click();
	await page.getByRole('option', { name: 'My Team' }).click();
	await page.getByRole('button', { name: 'Save' }).click();
	await page.getByRole('button', { name: 'Create' }).click();
	await expect(
		page.locator('a[href^="https://linear.app/tunnel-dev/issue/"]'),
	).toBeVisible();
});
