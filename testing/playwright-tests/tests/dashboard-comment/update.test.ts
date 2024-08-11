import { defineTest } from '#utils/test.ts';
import { defineTestFixtures } from '@-/database-test-fixtures';

export const getFixtures = defineTestFixtures(
	'dashboard-comment-update',
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

test.fixme('updating a comment thread from the organization page', async ({ state, page }) => {
	const {
		organization,
		project,
	} = state.fixtures;

	await page.goto(
		`https://tunnel.test/${organization.slug}/projects/${project.slug}`,
	);
});
