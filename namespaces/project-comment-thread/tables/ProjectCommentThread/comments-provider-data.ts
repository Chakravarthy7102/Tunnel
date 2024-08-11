import { defineSelection, getInclude } from '@-/database/selection-utils';
import {
	ProjectComment_$commentsProviderData,
	ProjectCommentThreadAsanaTaskRelation_$commentsProviderData,
	ProjectCommentThreadJiraIssueRelation_$commentsProviderData,
	ProjectCommentThreadLinearIssueRelation_$commentsProviderData,
	ProjectCommentThreadSlackMessageRelation_$commentsProviderData,
	ProjectCommentThreadWindowMetadata_$all,
} from '@-/database/selections';

export const ProjectCommentThread_$commentsProviderData = defineSelection(
	'ProjectCommentThread',
	() => ({
		sessionEventsFile: true,
		sessionEventsThumbnailFile: true,
		consoleLogsFile: true,
		networkLogEntriesFile: true,
		anchorElementXpath: true,
		comments: {
			include: getInclude(ProjectComment_$commentsProviderData),
		},
		resolvedByUser: true,
		linearIssueRelation: {
			include: getInclude(
				ProjectCommentThreadLinearIssueRelation_$commentsProviderData,
			),
		},
		jiraIssueRelation: {
			include: getInclude(
				ProjectCommentThreadJiraIssueRelation_$commentsProviderData,
			),
		},
		slackMessageRelation: {
			include: getInclude(
				ProjectCommentThreadSlackMessageRelation_$commentsProviderData,
			),
		},
		asanaTaskRelation: {
			include: getInclude(
				ProjectCommentThreadAsanaTaskRelation_$commentsProviderData,
			),
		},
		windowMetadata_: {
			include: getInclude(ProjectCommentThreadWindowMetadata_$all),
		},
		gitMetadata_: true,
		linkedProjectLivePreview: true,
		project: {
			include: {
				organization: true,
			},
		},
		organization: true,
	}),
);
