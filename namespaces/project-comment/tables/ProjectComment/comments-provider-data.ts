import { defineSelection, getInclude } from '@-/database/selection-utils';
import {
	ProjectAsanaTask_$all,
	ProjectJiraIssue_$all,
	ProjectLinearIssue_$all,
	ProjectSlackMessage_$all,
	User_$commentsProviderData,
} from '@-/database/selections';

export const ProjectComment_$commentsProviderData = defineSelection(
	'ProjectComment',
	() => ({
		files: true,
		authorUser: {
			include: getInclude(User_$commentsProviderData),
		},
		content: true,
		contentTextContent: true,
		parentCommentThread: {
			include: {
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
			},
		},
	}),
);
