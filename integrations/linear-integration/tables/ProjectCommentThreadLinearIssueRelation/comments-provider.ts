import { defineSelection, getInclude } from '@-/database/selection-utils';
import { ProjectLinearIssue_$all } from '@-/database/selections';

export const ProjectCommentThreadLinearIssueRelation_$commentsProviderData =
	defineSelection('ProjectCommentThreadLinearIssueRelation', () => ({
		projectLinearIssue: {
			include: getInclude(ProjectLinearIssue_$all),
		},
	}));
