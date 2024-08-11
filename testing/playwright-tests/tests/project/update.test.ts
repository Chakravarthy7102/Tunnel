import { defineTest } from '#utils/test.ts';
import { ApiConvex } from '@-/convex/api';
import { defineTestFixtures } from '@-/database-test-fixtures';
import { expect } from 'playwright/test';

export const getFixtures = defineTestFixtures(
	'project-update',
	({ authSession }) => ({
		user: {
			type: 'User',
			authSession: authSession.actor(),
		},
		project: {
			type: 'Project',
			ownerOrganization: 'user',
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

// FIXME
test.fixme('updating project name', async ({ state, page }) => {
	const {
		project,
		organization,
	} = state.fixtures;

	await page.goto(
		`https://tunnel.test/${organization.slug}/projects/${project.slug}/settings`,
		{ waitUntil: 'networkidle' },
	);
	await page.getByLabel('Project Name').fill('Updated Project Name');
	await Promise.all([
		page.getByRole('button', { name: 'Save' }).click(),
		page.waitForResponse((response) =>
			response.url().includes('project.update')
		),
	]);
	const updatedProject = await ApiConvex.v.Project.get({
		from: { id: project._id },
		include: {},
	}).unwrapOrThrow();
	expect(updatedProject?.name).toEqual('Updated Project Name');
});
