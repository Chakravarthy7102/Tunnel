import { defineTest } from '#utils/test.ts';
import { ApiConvex } from '@-/convex/api';
import { defineTestFixtures } from '@-/database-test-fixtures';
import { expect } from 'playwright/test';

export const getFixtures = defineTestFixtures(
	'organization-leave',
	({ authSession }) => ({
		ownerUser: {
			type: 'User',
			authSession: authSession(1),
		},
		organization: {
			type: 'Organization',
			ownerUser: 'ownerUser',
		},
		memberUser: {
			type: 'User',
			authSession: authSession.actor(),
		},
		organizationMember: {
			type: 'OrganizationMember',
			user: 'memberUser',
			organization: 'organization',
			role: 'member',
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

test('leaving an organization', async ({ state, page }) => {
	const {
		organization,
		memberUser,
	} = state.fixtures;

	await page.goto(`https://tunnel.test/${organization.slug}/settings`, {
		waitUntil: 'networkidle',
	});
	await page
		.getByText(memberUser.email)
		.locator('../../..')
		.locator('.lucide-more-horizontal')
		.click();
	await page.getByRole('menuitem', { name: 'Leave organization' }).click();
	await page.getByRole('button', { name: 'Leave this organization' }).click();
	await expect(page).toHaveURL('https://tunnel.test/welcome');
	const updatedOrganization = await ApiConvex.v.Organization.get({
		from: { id: organization._id },
		include: {},
	}).unwrapOrThrow();
	expect(updatedOrganization?.membersCount).toEqual(1);
});
