import { defineSelection } from '@-/database/selection-utils';

export const ProjectCommentThread_$webhookData = defineSelection(
	'ProjectCommentThread',
	() => ({
		comments: true,
	}),
);
