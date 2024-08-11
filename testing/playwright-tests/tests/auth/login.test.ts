import { defineTest } from '#utils/test.ts';
import {
	defineTestFixtures,
	TEST_USER_PASSWORD,
} from '@-/database-test-fixtures';
import { expect } from 'playwright/test';

export const getFixtures = defineTestFixtures(
	'login',
	({ authSession }) => ({
		existingUser: {
			authSession: authSession.actor(),
			type: 'User',
		},
	}),
);

const test = defineTest({
	authenticated: false,
	async getState(args) {
		const fixtures = await getFixtures(args);
		return {
			fixtures,
		};
	},
});

test('logging in with email + password', async ({ page, state }) => {
	const { existingUser } = state.fixtures;
	await page.goto('https://tunnel.test/login');
	await page.getByLabel('Email').fill(existingUser.email);
	await page.getByLabel('Password', { exact: true }).fill(
		TEST_USER_PASSWORD,
	);
	await page.getByRole('button', { name: 'Login' }).click();
	await expect(page).toHaveURL('https://tunnel.test/welcome');
});
