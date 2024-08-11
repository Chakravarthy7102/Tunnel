import { defineTest } from '#utils/test.ts';
import { ApiConvex } from '@-/convex/api';
import { defineTestFixtures } from '@-/database-test-fixtures';
import { expect } from 'playwright/test';

export const getFixtures = defineTestFixtures(
	'organization-demote-member',
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
			role: 'admin',
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

test('demoting a user to member', async ({ state, page }) => {
	const {
		organization,
		memberUser,
		organizationMember,
	} = state.fixtures;

	await page.goto(`https://tunnel.test/${organization.slug}/settings/people`, {
		waitUntil: 'networkidle',
	});
	await page
		.getByText(memberUser.email)
		.locator('../../..')
		.locator('button', { hasText: 'Admin' })
		.click();
	await Promise.all([
		page.waitForResponse((response) =>
			response.url().includes('organization.updateMemberRole')
		),
		page.getByLabel('Member').click(),
	]);
	const updatedOrganizationMember = await ApiConvex.v.OrganizationMember.get({
		from: { id: organizationMember._id },
		include: {},
	}).unwrapOrThrow();
	expect(updatedOrganizationMember?.role).toBe('member');
});
