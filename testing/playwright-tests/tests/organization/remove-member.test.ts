import { defineTest } from '#utils/test.ts';
import { ApiConvex } from '@-/convex/api';
import { defineTestFixtures } from '@-/database-test-fixtures';
import { expect } from 'playwright/test';

export const getFixtures = defineTestFixtures(
	'organization-remove-member',
	({ authSession }) => ({
		ownerUser: {
			type: 'User',
			authSession: authSession.actor(),
		},
		organization: {
			type: 'Organization',
			ownerUser: 'ownerUser',
		},
		memberUser: {
			type: 'User',
			authSession: authSession(1),
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

test('removing a user from an organization', async ({ state, page }) => {
	const {
		organization,
		memberUser,
	} = state.fixtures;

	await page.goto(`https://tunnel.test/${organization.slug}/settings/people`, {
		waitUntil: 'networkidle',
	});
	await page
		.getByText(memberUser.email)
		.locator('../../..')
		.locator('.lucide-more-horizontal')
		.click();
	await page.getByRole('menuitem', { name: 'Remove user' }).click();
	const deleteResponse = page.waitForResponse(
		(response) => response.url().includes('organization.removeUser'),
	);
	await page.getByRole('button', { name: 'Remove this user' }).click();
	await expect(page.getByText(memberUser.email)).toHaveCount(0);
	await deleteResponse;
	const updatedOrganization = await ApiConvex.v.Organization.get({
		from: { id: organization._id },
		include: { members: { include: { user: true } } },
	}).unwrapOrThrow();
	expect(
		updatedOrganization?.members.find((member) =>
			member.user._id === memberUser._id
		),
	)
		.toBe(undefined);
});
