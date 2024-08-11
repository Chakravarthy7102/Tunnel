import { defineTest } from '#utils/test.ts';
import { defineTestFixtures } from '@-/database-test-fixtures';

export const getFixtures = defineTestFixtures(
	'organization-invitation-send',
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

test.fixme('sending an organization invitation', () => {
});

test.fixme('resending an organization invitation', () => {});
