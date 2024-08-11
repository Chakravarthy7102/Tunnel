import { defineSelection } from '@-/database/selection-utils';

export const Project_$dashboardPageData = defineSelection('Project', () => ({
	organization: true,
	livePreviews: true,
	invitations: {
		include: {
			recipientUser: true,
		},
	},
	commentThreads: {
		include: {
			resolvedByUser: true,
		},
	},
	gitlabProject: true,
}));
