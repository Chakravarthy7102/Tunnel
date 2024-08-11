import { defineTest } from '#utils/test.ts';
import { ApiConvex } from '@-/convex/api';
import { defineTestFixtures } from '@-/database-test-fixtures';
import { ApiOrganization } from '@-/organization/api';
import { expect } from 'playwright/test';
import { fillWelcomeForm } from './helpers/welcome.ts';

export const getFixtures = defineTestFixtures(
	'organization-create-second',
	({ authSession }) => ({
		user: {
			type: 'User',
			authSession: authSession.actor(),
		},
		existingOrganization: {
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
			secondOrganizationSlug: 'my-second-organization-slug',
		};
	},
	async after({ secondOrganizationSlug }) {
		const organization = await ApiConvex.v.Organization.get({
			from: { slug: secondOrganizationSlug },
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

test('creating a second organization', async ({ state, page }) => {
	const {
		fixtures: {
			existingOrganization,
		},
		secondOrganizationSlug,
	} = state;

	// Navigate to the create organization page by clicking the organization dropdown
	await page.goto(`https://tunnel.test/${existingOrganization.slug}`, {
		waitUntil: 'networkidle',
	});
	await page.getByRole('button', { name: existingOrganization.name }).click();
	await page.getByText('New Organization').click();

	await expect(page).toHaveURL('https://tunnel.test/welcome');

	await fillWelcomeForm(page, {
		name: 'My Second Organization',
		slug: secondOrganizationSlug,
	});

	await expect(page).toHaveURL(
		`https://tunnel.test/${secondOrganizationSlug}/welcome`,
	);

	await expect(page.getByText('Welcome to Tunnel')).toBeVisible();
});
