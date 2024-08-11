import { defineTest } from '#utils/test.ts';
import { ApiConvex } from '@-/convex/api';
import { defineTestFixtures } from '@-/database-test-fixtures';
import { expect } from 'playwright/test';

export const getFixtures = defineTestFixtures(
	'project-delete',
	({ authSession }) => ({
		user: {
			type: 'User',
			authSession: authSession.actor(),
		},
		project: {
			type: 'Project',
			ownerOrganization: 'organization',
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

test('deleting a project', async ({ state, page }) => {
	const {
		project,
		organization,
	} = state.fixtures;

	await page.goto(
		`https://tunnel.test/${organization.slug}/projects/${project.slug}/settings`,
		{ waitUntil: 'networkidle' },
	);
	await page.getByRole('button', { name: 'Delete this project' }).click();
	await page.getByLabel('To confirm').fill(project.name);
	await page.getByRole('button', { name: 'Delete this project' })
		.click();

	await expect(page).toHaveURL(`https://tunnel.test/${organization.slug}`);

	const deletedProject = await ApiConvex.v.Project.get({
		from: { id: project._id },
		include: {},
	}).unwrapOrThrow();
	expect(deletedProject).toEqual(null);
});
