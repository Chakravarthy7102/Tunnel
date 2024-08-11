import { defineTest } from '#utils/test.ts';
import { ApiConvex } from '@-/convex/api';
import { defineTestFixtures } from '@-/database-test-fixtures';
import { expect } from 'playwright/test';

export const getFixtures = defineTestFixtures(
	'dashboard-comment-delete-reply',
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
		projectComment: {
			type: 'ProjectComment',
			parentCommentThread: 'projectCommentThread',
			authorUser: 'user',
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

test('deleting a reply to a comment thread from the organization page', async ({ state, page }) => {
	const {
		projectCommentThread,
		organization,
	} = state.fixtures;

	await page.goto(
		`https://tunnel.test/${organization.slug}/comments/${projectCommentThread._id}`,
	);

	// Get the reply right above the new thread input
	await page.locator('[data-placeholder="Write something ..."]')
		.locator('../../../../preceding-sibling::div[1]')
		.getByTestId('comment-more-button').click();
	await page.getByRole('menuitem', { name: 'Delete' }).click();
	await page.waitForResponse((response) =>
		response.url().includes('projectComment.delete')
	);
	const updatedProjectCommentThread = await ApiConvex.v.ProjectCommentThread
		.get({
			from: { id: projectCommentThread._id },
			include: { comments: true },
		}).unwrapOrThrow();
	expect(updatedProjectCommentThread?.comments).toHaveLength(1);
});
