import { defineTest } from '#utils/test.ts';
import { defineTestFixtures } from '@-/database-test-fixtures';

export const getFixtures = defineTestFixtures(
	'dashboard-filters-jira',
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

async function testResolvedFilter(_args: { pageUrl: string }) {
}

test.fixme('filters by resolved comments works on the organization page', async ({ state }) => {
	const { organization } = state.fixtures;
	await testResolvedFilter({
		pageUrl: `https://tunnel.test/${organization.slug}`,
	});
});

test.fixme('filters by resolved comments works on the project page', async ({ state }) => {
	const { organization, project } = state.fixtures;
	await testResolvedFilter({
		pageUrl:
			`https://tunnel.test/${organization.slug}/projects/${project.slug}`,
	});
});

async function testUnresolvedFilter(_args: { pageUrl: string }) {
}

test.fixme('filters by unresolved comments works on the organization page', async ({ state }) => {
	const { organization } = state.fixtures;
	await testUnresolvedFilter({
		pageUrl: `https://tunnel.test/${organization.slug}`,
	});
});

test.fixme('filters by unresolved comments works on the project page', async ({ state }) => {
	const { organization, project } = state.fixtures;
	await testUnresolvedFilter({
		pageUrl:
			`https://tunnel.test/${organization.slug}/projects/${project.slug}`,
	});
});
