import { defineSelection, getInclude } from '@-/database/selection-utils';
import { ProjectJiraIssue_$all } from '@-/database/selections';

export const ProjectCommentThreadJiraIssueRelation_$commentsProviderData =
	defineSelection('ProjectCommentThreadJiraIssueRelation', () => ({
		projectJiraIssue: {
			include: getInclude(ProjectJiraIssue_$all),
		},
	}));
