import { defineTest } from '#utils/test.ts';
import { defineTestFixtures } from '@-/database-test-fixtures';

export const getFixtures = defineTestFixtures(
	'organization-invitation-accept',
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

test.fixme('accepting an organization invitation from the email', () => {});

test.fixme('accepting an organization invitation from notifications', () => {});
