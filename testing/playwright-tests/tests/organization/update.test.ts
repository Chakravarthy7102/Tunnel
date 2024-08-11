import { defineTest } from '#utils/test.ts';
import { ApiConvex } from '@-/convex/api';
import { defineTestFixtures } from '@-/database-test-fixtures';
import { expect } from 'playwright/test';

export const getFixtures = defineTestFixtures(
	'organization-update',
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

test('updating organization name', async ({ state, page }) => {
	const { organization } = state.fixtures;

	await page.goto(`https://tunnel.test/${organization.slug}/settings`, {
		waitUntil: 'networkidle',
	});
	await page.getByLabel('Name').fill('Updated Organization Name');
	await Promise.all([
		page.getByRole('button', { name: 'Save' }).click(),
		page.waitForResponse((response) =>
			response.url().includes('organization.update')
		),
	]);
	const updatedOrganization = await ApiConvex.v.Organization.get({
		from: { id: organization._id },
		include: {},
	}).unwrapOrThrow();
	expect(updatedOrganization?.name).toEqual('Updated Organization Name');
});

// FIXME
test.fixme('updating organization slug', async ({ state, page }) => {
	const { organization } = state.fixtures;

	await page.goto(`https://tunnel.test/${organization.slug}/settings`);
	await page.getByLabel('Slug').click();
	await page.getByLabel('Slug').fill('updated-organization-slug');
	await Promise.all([
		page.getByRole('button', { name: 'Save' }).click(),
		page.waitForResponse((response) =>
			response.url().includes('organization.update')
		),
	]);
	const updatedOrganization = await ApiConvex.v.Organization.get({
		from: { id: organization._id },
		include: {},
	}).unwrapOrThrow();
	expect(updatedOrganization?.slug).toEqual('updated-organization-slug');
});

test.fixme('updating organization logo', () => {});
