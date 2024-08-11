import { defineTest } from '#utils/test.ts';
import { ApiConvex } from '@-/convex/api';
import { defineTestFixtures } from '@-/database-test-fixtures';
import { expect } from 'playwright/test';

export const getFixtures = defineTestFixtures(
	'dashboard-comment-reply',
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
			ownerOrganization: 'organization',
			type: 'Project',
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

test('replying to a comment thread from the organization page', async ({ state, page }) => {
	const {
		projectCommentThread,
		organization,
		project,
	} = state.fixtures;

	await page.goto(
		`https://tunnel.test/${organization.slug}/projects/${project.slug}`,
		{ waitUntil: 'networkidle' },
	);
	await page.locator('.lucide-message-circle').click();
	await expect(page).toHaveURL(
		`https://tunnel.test/${organization.slug}/comments/${projectCommentThread._id}`,
	);
	await page.waitForLoadState('networkidle');
	await page.locator('[data-placeholder="Write something ..."]').click();
	await page
		.locator('.ProseMirror')
		.filter({ has: page.locator('[data-placeholder="Write something ..."]') })
		.pressSequentially('This is a reply');
	await page.getByRole('button', { name: 'Create', exact: true }).click();
	await page.waitForResponse((response) =>
		response.url().includes('projectComment.create')
	);
	const repliedToProjectCommentThread = await ApiConvex.v.ProjectCommentThread
		.get(
			{
				from: { id: projectCommentThread._id },
				include: { comments: true },
			},
		).unwrapOrThrow();
	expect(repliedToProjectCommentThread?.comments).toHaveLength(2);
});
