import { ApiAsana } from '@-/asana-integration/api';
import { ApiConvex } from '@-/convex/api';
import { type Id } from '@-/database';
import { getInclude } from '@-/database/selection-utils';
import {
	GithubPullRequestRelation_$allGithubPullRequest,
	ProjectAsanaTask_$all,
	ProjectJiraIssue_$all,
	ProjectLinearIssue_$all,
	ProjectSlackMessage_$all,
} from '@-/database/selections';
import { ApiJira } from '@-/jira-integration/api';
import { ApiLinear } from '@-/linear-integration/api';
import { ApiSlack } from '@-/slack-integration/api';
import { $try, ok } from 'errok';

export const ApiProjectCommentThread_delete = ({ input: { id } }: {
	input: { id: Id<'ProjectCommentThread'> };
}) => ($try(async function*() {
	const projectCommentThread = yield* ApiConvex.v.ProjectCommentThread.get({
		from: { id },
		include: {
			gitMetadata_: true,
			project: {
				include: {
					organization: true,
					githubPullRequestRelations: {
						include: getInclude(
							GithubPullRequestRelation_$allGithubPullRequest,
						),
					},
				},
			},
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
			comments: {
				include: {
					authorUser: true,
				},
			},
		},
	}).safeUnwrap();

	// Do nothing if the comment thread was not found
	if (projectCommentThread === null) {
		return ok();
	}

	yield* ApiConvex.v.ProjectCommentThread._delete({ input: { id } })
		.safeUnwrap();

	const authorUser = projectCommentThread.comments[0]?.authorUser;
	if (!authorUser) {
		return ok();
	}

	const organizationMember = yield* ApiConvex.v.OrganizationMember.get({
		from: {
			organization: projectCommentThread.project.organization._id,
			user: authorUser._id,
		},
		include: {
			linkedSlackAccount: true,
			organization: {
				include: {
					linearOrganization: true,
				},
			},
		},
	}).safeUnwrap();

	if (organizationMember !== null) {
		if (projectCommentThread.jiraIssueRelation) {
			try {
				const jiraClient = yield* ApiJira.getClient({
					organizationMemberId: organizationMember._id,
				}).safeUnwrap();

				await jiraClient.issues.deleteIssue({
					issueIdOrKey:
						projectCommentThread.jiraIssueRelation.projectJiraIssue.issueId,
				});
			} catch {
				// Issue was most likely already deleted
			}
		}

		if (
			projectCommentThread.linearIssueRelation &&
			organizationMember.organization.linearOrganization &&
			organizationMember.organization.linearOrganization.access_token
		) {
			try {
				const linearClient = yield* ApiLinear.getClient({
					organizationMemberId: organizationMember._id,
				}).safeUnwrap();

				await linearClient.deleteIssue(
					projectCommentThread.linearIssueRelation.projectLinearIssue.issueId,
				);
			} catch {
				// Issue was most likely already deleted
			}
		}

		if (
			projectCommentThread.slackMessageRelation &&
			organizationMember.linkedSlackAccount &&
			organizationMember.linkedSlackAccount.accessToken
		) {
			try {
				const slackClient = yield* ApiSlack.getClient({
					organizationMemberId: organizationMember._id,
					asBot: true,
				}).safeUnwrap();

				await slackClient.chat.delete({
					channel: projectCommentThread.slackMessageRelation.projectSlackMessage
						.channelId,
					ts: projectCommentThread.slackMessageRelation.projectSlackMessage
						.messageId,
				});
			} catch {
				// Message was most likely already deleted
			}
		}

		if (projectCommentThread.asanaTaskRelation) {
			try {
				const asanaClient = yield* ApiAsana.getClient({
					organizationMemberId: organizationMember._id,
				}).safeUnwrap();

				await asanaClient.tasks.delete(
					projectCommentThread.asanaTaskRelation.projectAsanaTask.gid,
				);
			} catch {
				// Task was most likely already deleted
			}
		}
	}

	return ok();
}));
