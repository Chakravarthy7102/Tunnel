import { defineTest } from '#utils/test.ts';
import { ApiConvex } from '@-/convex/api';
import { defineTestFixtures } from '@-/database-test-fixtures';
import { expect } from 'playwright/test';

export const getFixtures = defineTestFixtures(
	'organization-delete',
	({ authSession }) => ({
		user: {
			type: 'User',
			authSession: authSession.actor(),
		},
		organization: {
			type: 'Organization',
			ownerUser: 'user',
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

test('deleting an organization', async ({ state, page }) => {
	const {
		organization,
	} = state.fixtures;

	await page.goto(`https://tunnel.test/${organization.slug}/settings`, {
		waitUntil: 'networkidle',
	});
	await page.getByText('Delete this organization').click();
	await page.getByLabel('To confirm').fill(organization.slug);
	await page.getByRole('button', { name: 'Delete this organization' })
		.click();

	// If the user is left with no organizations, they should be redirected to the "/welcome" page
	await expect(page).toHaveURL('https://tunnel.test/welcome');
	const deletedOrganization = await ApiConvex.v.Organization.get({
		from: { id: organization._id },
		include: {},
	}).unwrapOrThrow();
	expect(deletedOrganization).toEqual(null);
});
