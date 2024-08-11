import type { JSONContent } from '@-/comments';
import { ApiConvex } from '@-/convex/api';
import {
	type DocBase,
	type Id,
} from '@-/database';
import { RELEASE } from '@-/env/app';
import { DocumentNotFoundError } from '@-/errors';
import type { ProjectCommentThreadGitMetadata } from '@-/git-metadata';
import { ApiGithub } from '@-/github-integration/api';
import { ApiGitlab } from '@-/gitlab-integration/api';
import type { HostEnvironmentType } from '@-/host-environment';
import type {
	CreatedJiraIssue,
	LinearIssue,
	SlackMessage,
} from '@-/integrations';
import { logger } from '@-/logger';
import { ApiProjectComment } from '@-/project-comment';
import { ApiSlack } from '@-/slack-integration/api';
import { getReleaseProjectLivePreviewUrl } from '@-/url';
import { ApiUrl } from '@-/url/api';
import type { WindowMetadata } from '@-/window-metadata';
import { $try, err, ok, ResultAsync } from 'errok';

export const ApiProjectCommentThread_create = ({
	projectId,
	projectLivePreviewId,
	content,
	contentTextContent,
	anchorElementXpath,
	percentageLeft,
	percentageTop,
	route,
	fileIds,
	createdJiraIssue,
	createdLinearIssue,
	createdSlackMessage,
	authorUserId,
	windowMetadata,
	gitMetadata,
	sessionEventsFileId,
	sessionEventsThumbnailFileId,
	consoleLogsFileId,
	consoleLogEntriesCount,
	networkLogEntriesFileId,
	networkLogEntriesCount,
	hostEnvironmentType,
}: {
	authorUserId: Id<'User'>;
	projectLivePreviewId: Id<'ProjectLivePreview'> | null;
	projectId: Id<'Project'>;
	content: JSONContent[];
	contentTextContent: string;
	anchorElementXpath: string | null;
	percentageLeft: number;
	percentageTop: number;
	route: string;
	fileIds: Id<'File'>[];
	createdJiraIssue: CreatedJiraIssue | null;
	createdLinearIssue: LinearIssue | null;
	createdSlackMessage: SlackMessage | null;
	windowMetadata: WindowMetadata | null;
	gitMetadata: ProjectCommentThreadGitMetadata | null;
	sessionEventsFileId: Id<'File'> | null;
	sessionEventsThumbnailFileId: Id<'File'> | null;
	consoleLogEntriesCount: number;
	consoleLogsFileId: Id<'File'> | null;
	networkLogEntriesCount: number;
	networkLogEntriesFileId: Id<'File'> | null;
	hostEnvironmentType: HostEnvironmentType | null;
	// eslint-disable-next-line complexity -- todo
}) => ($try(async function*() {
	const project = yield* ApiConvex.v.Project.get({
		from: { id: projectId },
		include: {
			organization: true,
			githubPullRequestRelations: {
				include: {
					githubPullRequest: true,
				},
			},
			gitlabMergeRequestRelations: {
				include: {
					gitlabMergeRequest: {
						include: {
							authorOrganizationMember: true,
						},
					},
				},
			},
		},
	}).safeUnwrap();

	if (project === null) {
		return err(new DocumentNotFoundError('Project'));
	}

	const organizationId = project.organization._id;

	const projectCommentThread = yield* ApiConvex.v.ProjectCommentThread._create({
		input: {
			data: {
				anchorElementXpath,
				project: projectId,
				organization: organizationId,
				percentageLeft,
				percentageTop,
				resolvedByUser: null,
				route,
				linkedProjectLivePreview: projectLivePreviewId ?? null,
				windowMetadata,
				gitMetadata,
				slackMetadata: createdSlackMessage,
				networkLogEntriesCount,
				consoleLogEntriesCount,
			},
			include: {
				windowMetadata_: true,
				gitMetadata_: true,
			},
		},
	}).safeUnwrap();

	if (sessionEventsFileId !== null) {
		yield* ApiConvex.v.File.update({
			input: {
				id: sessionEventsFileId,
				updates: {
					projectCommentThread: projectCommentThread._id,
				},
			},
		}).safeUnwrap();
	}

	if (sessionEventsThumbnailFileId !== null) {
		yield* ApiConvex.v.File.update({
			input: {
				id: sessionEventsThumbnailFileId,
				updates: {
					projectCommentThreadSessionEventsThumbnail: projectCommentThread._id,
				},
			},
		}).safeUnwrap();
	}

	if (consoleLogsFileId !== null) {
		yield* ApiConvex.v.File.update({
			input: {
				id: consoleLogsFileId,
				updates: {
					projectCommentThreadConsoleLogs: projectCommentThread._id,
				},
			},
		}).safeUnwrap();
	}

	if (networkLogEntriesFileId !== null) {
		yield* ApiConvex.v.File.update({
			input: {
				id: networkLogEntriesFileId,
				updates: {
					projectCommentThreadNetworkLogEntries: projectCommentThread._id,
				},
			},
		}).safeUnwrap();
	}

	const subscriptions =
		(await ApiConvex.v.OrganizationMemberSlackSubscription.list({
			where: {
				organization: organizationId,
			},
			include: {
				organization: true,
				project: true,
			},
		})).unwrapOrThrow();

	const organizationMember = yield* ApiConvex.v.OrganizationMember.get({
		from: {
			organization: organizationId,
			user: authorUserId,
		},
		include: {},
	}).safeUnwrap();

	let projectLivePreview: DocBase<'ProjectLivePreview'> | null = null;

	if (projectLivePreviewId !== null) {
		projectLivePreview = yield* ApiConvex.v.ProjectLivePreview.get({
			from: { id: projectLivePreviewId },
			include: {},
		}).safeUnwrap();
	}

	if (subscriptions.length > 0) {
		const slackMessageResult = await ResultAsync.combinePromises(
			subscriptions.map(async (subscription) => {
				if (!organizationMember) {
					return ok();
				} else if (subscription.organization._id !== organizationId) {
					return ok();
				} else if (
					subscription.project && subscription.project._id !== projectId
				) {
					return ok();
				}

				return ApiSlack.createMessage({
					organizationMemberId: organizationMember._id,
					projectId: project._id,
					content: contentTextContent,
					channelId: subscription.channelId,
					channelName: subscription.channelName,
					attachments: [],
					commentThreadId: projectCommentThread._id,
					tunnelUrl: projectLivePreviewId === null ?
						ApiUrl.getWebappUrl({
							fromRelease: RELEASE,
							withScheme: true,
							path: `/${project.organization.slug}/projects/${project.slug}`,
						}) :
						getReleaseProjectLivePreviewUrl({
							hostname: projectLivePreview?.url ?? '',
							path: route,
							withScheme: true,
						}),
				});
			}),
		);

		if (slackMessageResult.isErr()) {
			logger.error(
				'Failed to create slack message:',
				slackMessageResult.error,
			);
		}
	}

	if (createdLinearIssue !== null) {
		const projectLinearIssueId = yield* ApiConvex.v.ProjectLinearIssue.create({
			input: {
				data: {
					project: projectId,
					organization: organizationId,
					assignee: createdLinearIssue.assignee,
					identifier: createdLinearIssue.identifier,
					issueId: createdLinearIssue.id,
					issueUrl: createdLinearIssue.url,
					linearProject: createdLinearIssue.project,
					priority: createdLinearIssue.priority,
					status: createdLinearIssue.status,
					team: createdLinearIssue.team,
				},
			},
		}).safeUnwrap();

		const result = await ResultAsync.combinePromises(
			createdLinearIssue.labels.map(async (label) => {
				return ApiConvex.v.ProjectLinearIssueLabel.create({
					input: {
						data: {
							labelId: label.id,
							name: label.name,
							projectLinearIssue: projectLinearIssueId,
						},
					},
				});
			}),
		);

		if (result.isErr()) {
			logger.error('Failed to create linear issue labels');
		}

		yield* ApiConvex.v.ProjectCommentThreadLinearIssueRelation.create({
			input: {
				data: {
					projectCommentThread: projectCommentThread._id,
					projectLinearIssue: projectLinearIssueId,
				},
				include: {},
			},
		}).safeUnwrap();
	}

	if (createdJiraIssue !== null) {
		const projectJiraIssueId = yield* ApiConvex.v.ProjectJiraIssue.create({
			input: {
				data: {
					issueId: createdJiraIssue.id,
					key: createdJiraIssue.key,
					organization: organizationId,
					project: projectId,
					self: createdJiraIssue.self,
					url: createdJiraIssue.url,
					assignee: createdJiraIssue.assignee,
					issueType: createdJiraIssue.issueType,
					jiraProject: createdJiraIssue.project,
					parentIssue: createdJiraIssue.parentIssue,
				},
			},
		}).safeUnwrap();

		const result = await ResultAsync.combinePromises(
			createdJiraIssue.labels.map(async (label) => {
				return ApiConvex.v.ProjectJiraIssueLabel.create({
					input: {
						data: {
							name: label,
							projectJiraIssue: projectJiraIssueId,
						},
					},
				});
			}),
		);

		if (result.isErr()) {
			logger.error('Failed to create linear issue labels');
		}

		yield* ApiConvex.v.ProjectCommentThreadJiraIssueRelation.create({
			input: {
				data: {
					projectCommentThread: projectCommentThread._id,
					projectJiraIssue: projectJiraIssueId,
				},
				include: {},
			},
		}).safeUnwrap();
	}

	if (createdSlackMessage !== null) {
		const projectSlackMessageId = yield* ApiConvex.v.ProjectSlackMessage
			.create({
				input: {
					data: {
						organization: organizationId,
						project: projectId,
						channelId: createdSlackMessage.channelId,
						messageId: createdSlackMessage.messageId,
						permalink: createdSlackMessage.permalink,
						channelName: createdSlackMessage.channelName,
					},
				},
			}).safeUnwrap();

		yield* ApiConvex.v.ProjectCommentThreadSlackMessageRelation.create({
			input: {
				data: {
					projectCommentThread: projectCommentThread._id,
					projectSlackMessage: projectSlackMessageId,
				},
				include: {},
			},
		}).safeUnwrap();
	}

	if (
		gitMetadata &&
		gitMetadata.branchName &&
		project.organization.githubOrganization
	) {
		yield* ApiGithub.updatePullRequestComment({
			installationId: project.organization.githubOrganization.id,
			currentBranch: gitMetadata.branchName,
			githubPullRequestRelations: project.githubPullRequestRelations,
		}).safeUnwrap();
	}

	if (
		gitMetadata && gitMetadata.branchName &&
		project.gitlabMergeRequestRelations.length > 0
	) {
		yield* ApiGitlab.updateMergeRequest({
			currentBranch: gitMetadata.branchName,
			gitlabMergeRequestRelations: project.gitlabMergeRequestRelations,
			organization: project.organization,
		}).safeUnwrap();
	}

	const comment = yield* ApiProjectComment.create({
		input: {
			data: {
				contentTextContent,
				authorUserId,
				parentCommentThreadId: projectCommentThread._id,
				content,
				fileIds,
				isParent: true,
				sentBySlack: false,
			},
			include: {},
		},
		hostEnvironmentType,
	}).safeUnwrap();

	return ok(
		{ ...projectCommentThread, comments: [comment] },
	);
}));
