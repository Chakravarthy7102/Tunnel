import { defineTest } from '#utils/test.ts';
import { defineTestFixtures } from '@-/database-test-fixtures';

const getFixtures = defineTestFixtures(
	'script-tag-comments',
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

test.fixme('leaving a comment using the toolbar', () => {
});

test.fixme('viewing a comment from the inbox', () => {});

test.fixme('comments show up in inbox', () => {});

test.fixme('capturing a screenshot', () => {});

test.fixme('replying to a comment', () => {});
test.fixme('replying to a comment with an image', () => {});

test.fixme('deleting a reply', () => {});
test.fixme('editing a reply', () => {});

test.fixme('new replies show up in real time', () => {});
