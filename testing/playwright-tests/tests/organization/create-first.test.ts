import { defineTest } from '#utils/test.ts';
import { ApiConvex } from '@-/convex/api';
import { defineTestFixtures } from '@-/database-test-fixtures';
import { ApiOrganization } from '@-/organization/api';
import { expect } from 'playwright/test';
import { fillWelcomeForm } from './helpers/welcome.ts';

export const getFixtures = defineTestFixtures(
	'organization-create-first',
	({ authSession }) => ({
		userWithNoOrganizations: {
			type: 'User',
			authSession: authSession.actor(),
		},
	}),
);

const test = defineTest({
	async getState(args) {
		return {
			fixtures: await getFixtures(args),
			firstOrganizationSlug: 'my-first-organization-slug',
		};
	},
	async after({ firstOrganizationSlug }) {
		const organization = await ApiConvex.v.Organization.get({
			from: { slug: firstOrganizationSlug },
			include: {},
		}).unwrapOrThrow();
		if (organization !== null) {
			await ApiOrganization.delete({
				input: {
					id: organization._id,
				},
			}).unwrapOrThrow();
		}
	},
});

// FIXME
test.fixme('creating a new organization for the first time', async ({ state, page }) => {
	const { firstOrganizationSlug } = state;

	// The user should be automatically redirected to "/welcome" if they don't have any organizations
	await page.goto('https://tunnel.test', { waitUntil: 'networkidle' });
	await expect(page).toHaveURL('https://tunnel.test/welcome');
	await page.waitForLoadState('networkidle');

	await fillWelcomeForm(page, {
		name: 'My Organization',
		slug: firstOrganizationSlug,
	});

	await expect(page).toHaveURL(
		`https://tunnel.test/${firstOrganizationSlug}/welcome`,
	);
});
