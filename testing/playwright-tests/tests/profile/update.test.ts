import { defineTest } from '#utils/test.ts';
import { ApiConvex } from '@-/convex/api';
import { defineTestFixtures } from '@-/database-test-fixtures';
import { expect } from 'playwright/test';

export const getFixtures = defineTestFixtures(
	'profile-update',
	({ authSession }) => ({
		user: {
			type: 'User',
			authSession: authSession.actor(),
		},
		// We need to create an organization in order to access the /profile route
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

// FIXME
test.fixme('updating account username', async ({ state, page }) => {
	const {
		user,
		organization,
	} = state.fixtures;
	await page.goto(`https://tunnel.test/${organization.slug}/profile`, {
		waitUntil: 'networkidle',
	});
	await page.getByLabel('Username').fill('my-new-username');
	await Promise.all([
		page.getByRole('button', { name: 'Save' }).click(),
		page.waitForResponse((response) => response.url().includes('user.update')),
	]);
	const updatedUser = await ApiConvex.v.User.get({
		from: { id: user._id },
		include: {},
	}).unwrapOrThrow();
	expect(updatedUser?.username).toBe('my-new-username');
});

// FIXME
test.fixme('updating full name', async ({ state, page }) => {
	const {
		user,
		organization,
	} = state.fixtures;
	await page.goto(`https://tunnel.test/${organization.slug}/profile`);
	await page.getByLabel('Full Name').fill('New Name');
	await Promise.all([
		page.getByRole('button', { name: 'Save' }).click(),
		page.waitForResponse((response) => response.url().includes('user.update')),
	]);
	const updatedUser = await ApiConvex.v.User.get({
		from: { id: user._id },
		include: {},
	}).unwrapOrThrow();
	expect(updatedUser?.fullName).toBe('New Name');
});

test.fixme('updating profile picture', () => {});
