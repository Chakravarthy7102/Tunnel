import { defineSelection, getInclude } from '@-/database/selection-utils';
import {
	ProjectAsanaTask_$all,
	ProjectCommentThreadWindowMetadata_$all,
	ProjectJiraIssue_$all,
	ProjectLinearIssue_$all,
	ProjectSlackMessage_$all,
} from '@-/database/selections';

export const ProjectCommentThread_$createdEventData = defineSelection(
	'ProjectCommentThread',
	() => ({
		project: {
			include: {
				organization: true,
			},
		},
		linkedProjectLivePreview: true,
		jiraIssueRelation: {
			include: {
				projectJiraIssue: {
					include: getInclude(ProjectJiraIssue_$all),
				},
			},
		},
		linearIssueRelation: {
			include: {
				projectLinearIssue: {
					include: getInclude(ProjectLinearIssue_$all),
				},
			},
		},
		slackMessageRelation: {
			include: {
				projectSlackMessage: {
					include: getInclude(ProjectSlackMessage_$all),
				},
			},
		},
		asanaTaskRelation: {
			include: {
				projectAsanaTask: {
					include: getInclude(ProjectAsanaTask_$all),
				},
			},
		},
		windowMetadata_: {
			include: getInclude(ProjectCommentThreadWindowMetadata_$all),
		},
	}),
);
