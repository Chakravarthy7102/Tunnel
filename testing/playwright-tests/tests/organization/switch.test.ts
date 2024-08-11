import { defineTest } from '#utils/test.ts';
import { defineTestFixtures } from '@-/database-test-fixtures';

export const getFixtures = defineTestFixtures(
	'organization-switch',
	() => ({}),
);

const test = defineTest({
	async getState(args) {
		return {
			fixtures: await getFixtures(args),
		};
	},
});

test.fixme('switching between organizations updates the dashboard view', () => {
});
