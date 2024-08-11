import { defineTest } from '#utils/test.ts';
import { defineTestFixtures } from '@-/database-test-fixtures';

export const getFixtures = defineTestFixtures(
	'organization-invitation-cancel',
	({ authSession }) => ({
		user: {
			type: 'User',
			authSession: authSession.actor(),
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

test.fixme('cancelling an organization invitation prevents the recipient from accepting it', () => {});
