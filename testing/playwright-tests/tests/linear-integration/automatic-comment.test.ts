import { linearMember } from '#constants/linear.ts';
import { registerLinearPageMocks } from '#mocks/linear.ts';
import { defineTest } from '#utils/test.ts';
import { defineTestFixtures } from '@-/database-test-fixtures';
import { expect } from 'playwright/test';

export const getFixtures = defineTestFixtures(
	'linear-integration-automatic-comment',
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

test.fixme('automatically creating a linear issue from a comment', async ({ state, page }) => {
	const {
		organization,
		project,
	} = state.fixtures;

	await page.goto(`https://tunnel.test/${organization.slug}/profile/linear`);
	await page.locator('button').filter({ hasText: 'Select team' })
		.click();
	await page.getByRole('option', { name: 'My Team' }).click();
	await page.getByRole('switch').click();
	await Promise.all([
		page.waitForResponse((response) => response.url().includes('user.update')),
		page.getByRole('button', { name: 'Save', exact: true }).click(),
	]);

	await page.goto(
		`https://tunnel.test/${organization.slug}/projects/${project.slug}`,
	);
	await page
		.locator('.ProseMirror')
		.filter({ has: page.locator('[data-placeholder="Write something ..."]') })
		.pressSequentially('This comment should create a Linear Issue');
	await page.getByRole('button', { name: 'Create', exact: true }).click();

	await expect(
		page.locator('a[href^="https://linear.app/tunnel-dev/issue/"]'),
	).toBeVisible();
});
