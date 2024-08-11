import { defineTest } from '#utils/test.ts';
import { ApiConvex } from '@-/convex/api';
import { defineTestFixtures } from '@-/database-test-fixtures';
import { expect } from 'playwright/test';

export const getFixtures = defineTestFixtures(
	'dashboard-comment-resolve',
	({ authSession }) => ({
		user: {
			type: 'User',
			authSession: authSession.actor(),
		},
		organization: {
			type: 'Organization',
			ownerUser: 'user',
		},
		project: {
			type: 'Project',
			ownerOrganization: 'organization',
		},
		projectCommentThread: {
			type: 'ProjectCommentThread',
			authorUser: 'user',
			project: 'project',
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

test('resolving a comment thread from the organization page', async ({ state, page }) => {
	const {
		projectCommentThread,
		organization,
		project,
	} = state.fixtures;

	await page.goto(
		`https://tunnel.test/${organization.slug}/projects/${project.slug}`,
		{ waitUntil: 'networkidle' },
	);
	await page.getByTestId('comment-more-button').click();
	await page.getByRole('menuitem', { name: 'Resolve thread' }).click();
	await expect(page.getByText('Resolved')).toBeVisible();
	await page.waitForResponse((response) =>
		response.url().includes('projectCommentThread.resolve')
	);
	const resolvedProjectCommentThread = await ApiConvex.v.ProjectCommentThread
		.get({
			from: { id: projectCommentThread._id },
			include: { resolvedByUser: true },
		}).unwrapOrThrow();
	expect(resolvedProjectCommentThread?.resolvedByUser).toBeTruthy();
});
