import { defineTest } from '#utils/test.ts';
import { defineTestFixtures } from '@-/database-test-fixtures';

export const getFixtures = defineTestFixtures(
	'dashboard-filters-route',
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
			identifier: 'proj',
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

async function testRouteFilter(
	_args: { pageUrl: string },
) {
}

test.fixme('filters by resolved comments works on the organization page', async ({ state }) => {
	const { organization } = state.fixtures;
	await testRouteFilter({
		pageUrl: `https://tunnel.test/${organization.slug}`,
	});
});

test.fixme('filters by resolved comments works on the project page', async ({ state }) => {
	const { organization, project } = state.fixtures;
	await testRouteFilter({
		pageUrl:
			`https://tunnel.test/${organization.slug}/projects/${project.slug}`,
	});
});
