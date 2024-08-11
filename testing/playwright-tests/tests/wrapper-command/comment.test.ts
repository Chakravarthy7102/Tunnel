import { defineTest } from '#utils/test.ts';
import { defineTestFixtures } from '@-/database-test-fixtures';

const getFixtures = defineTestFixtures(
	'wrapper-command-comment',
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
	}),
);

const test = defineTest({
	async getState(args) {
		return {
			fixtures: await getFixtures(args),
		};
	},
});

test.fixme('leaving a comment shows up on the shared tunnelapp url', () => {
});

test.fixme('replies to a comment show up in real time', () => {});
