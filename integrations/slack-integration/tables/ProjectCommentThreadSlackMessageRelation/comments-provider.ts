import { defineSelection, getInclude } from '@-/database/selection-utils';
import { ProjectSlackMessage_$all } from '@-/database/selections';

export const ProjectCommentThreadSlackMessageRelation_$commentsProviderData =
	defineSelection('ProjectCommentThreadSlackMessageRelation', () => ({
		projectSlackMessage: {
			include: getInclude(ProjectSlackMessage_$all),
		},
	}));
