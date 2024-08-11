import { defineTest } from '#utils/test.ts';
import { getWorkos } from '@-/auth/workos';
import { ApiConvex } from '@-/convex/api';
import {
	defineTestFixtures,
	TEST_USER_PASSWORD,
} from '@-/database-test-fixtures';
import { expect } from 'playwright/test';

export const getFixtures = defineTestFixtures('register', () => ({}));

const test = defineTest({
	authenticated: false,
	async getState(args) {
		return {
			fixtures: await getFixtures(args),
			registerEmail: 'newuser+tunnel_test@tunnel.dev',
		};
	},
	async after({ registerEmail }) {
		// We need to delete the WorkOS user that we used for registration
		const user = await ApiConvex.v.User.get({
			from: { email: registerEmail },
			include: {},
		}).unwrapOrThrow();
		if (user?.workosUserId) {
			const workos = getWorkos();
			await workos.userManagement.deleteUser(user.workosUserId);
		}
	},
});

test.fixme('registering a new user with email + password', async ({ state, page }) => {
	const { registerEmail } = state;
	await page.goto('https://tunnel.test/signup');
	await page.getByLabel('Email').fill(registerEmail);
	await page.getByLabel('Password', { exact: true }).fill(
		TEST_USER_PASSWORD,
	);
	await page.getByLabel('Confirm Password').fill(TEST_USER_PASSWORD);
	await page.getByRole('button', { name: 'Register' }).click();
	await expect(page).toHaveURL('https://tunnel.test/welcome');
});
