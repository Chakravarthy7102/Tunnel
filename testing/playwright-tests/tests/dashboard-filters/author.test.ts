import { defineTest } from '#utils/test.ts';
import { ApiConvex } from '@-/convex/api';
import type { ServerDoc } from '@-/database';
import { defineTestFixtures } from '@-/database-test-fixtures';
import { expect, type Page } from 'playwright/test';

export const getFixtures = defineTestFixtures(
	'dashboard-filters-author',
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
			project: 'project',
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

async function testAuthorFilter(
	{ pageUrl, page, user, projectCommentThreads }: {
		pageUrl: string;
		page: Page;
		user: ServerDoc<'User'>;
		projectCommentThreads: ServerDoc<'ProjectCommentThread'>[];
	},
) {
	await page.goto(pageUrl, { waitUntil: 'networkidle' });
	await page.getByRole('button', { name: 'Filter threads' }).click();
	await page.getByRole('menuitem', { name: 'Author' }).click();
	await page.getByRole('option', { name: user.fullName }).click();

	const projectCommentThreadsWithComments = await Promise.all(
		projectCommentThreads.map(async (projectCommentThread) =>
			ApiConvex.v.ProjectCommentThread.get({
				from: { id: projectCommentThread._id },
				include: {
					comments: {
						include: {
							authorUser: true,
						},
					},
				},
			}).unwrapOrThrow()
		),
	);

	const projectCommentThreadsWithAuthor = projectCommentThreadsWithComments
		.filter(
			(projectCommentThread) =>
				projectCommentThread?.comments[0]?.authorUser?._id === user._id,
		);

	await expect(
		page.locator('[data-testid=thread-preview-cards] > div'),
	).toHaveCount(projectCommentThreadsWithAuthor.length);
}

test.fixme('filtering by author works on the organization page', async ({ state, page }) => {
	const { organization, projectCommentThread, user } = state.fixtures;
	await testAuthorFilter({
		page,
		pageUrl: `https://tunnel.test/${organization.slug}`,
		projectCommentThreads: [projectCommentThread],
		user,
	});
});

test.fixme('filtering by author works on the project page', async ({ state, page }) => {
	const { organization, project, projectCommentThread, user } = state.fixtures;
	await testAuthorFilter({
		page,
		pageUrl:
			`https://tunnel.test/${organization.slug}/projects/${project.slug}`,
		projectCommentThreads: [projectCommentThread],
		user,
	});
});
