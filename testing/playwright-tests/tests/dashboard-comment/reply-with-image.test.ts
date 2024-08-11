import { fixturesDirpath } from '#utils/fixture.ts';
import { defineTest } from '#utils/test.ts';
import { ApiConvex } from '@-/convex/api';
import { defineTestFixtures } from '@-/database-test-fixtures';
import path from 'pathe';
import { expect } from 'playwright/test';

export const getFixtures = defineTestFixtures(
	'dashboard-comment-reply-with-file',
	({ authSession }) => ({
		user: {
			type: 'User',
			authSession: authSession.actor(),
		},
		organization: {
			type: 'Organization',
			ownerUser: 'user',
			slug: 'dashboard-comment-reply-with-file-organization',
		},
		project: {
			type: 'Project',
			ownerOrganization: 'organization',
			identifier: 'dashboard-comment-to-reply-with-file-project',
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

// FIXME
test.fixme('replying to a comment thread from the organization page with an image', async ({ state, page }) => {
	const {
		projectCommentThread,
		organization,
	} = state.fixtures;
	await page.goto(
		`https://tunnel.test/${organization.slug}/comments/${projectCommentThread._id}`,
	);
	await page.locator('[data-placeholder="Write something ..."]').click();
	await page
		.locator('.ProseMirror')
		.filter({ has: page.locator('[data-placeholder="Write something ..."]') })
		.pressSequentially('This is a reply with a file');
	const fileChooserPromise = page.waitForEvent('filechooser');
	await page
		.getByRole('button')
		.filter({ has: page.locator('.lucide-image') })
		.click();
	const fileChooser = await fileChooserPromise;
	await fileChooser.setFiles(path.join(fixturesDirpath, 'image.png'));
	await page.getByRole('button', { name: 'Create', exact: true }).click();
	await page.waitForResponse((response) =>
		response.url().includes('projectComment.create')
	);
	await expect(
		page.locator(
			'img[src^="TODO"]',
		),
	).toBeVisible();
	const repliedToProjectCommentThread = await ApiConvex.v.ProjectCommentThread
		.get(
			{
				from: { id: projectCommentThread._id },
				include: { comments: true },
			},
		).unwrapOrThrow();
	expect(repliedToProjectCommentThread?.comments).toHaveLength(2);
});
