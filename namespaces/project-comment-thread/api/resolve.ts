import { ApiAsana } from '@-/asana-integration/api';
import { ApiConvex } from '@-/convex/api';
import { type Id } from '@-/database';
import { getInclude } from '@-/database/selection-utils';
import {
	GithubPullRequestRelation_$allGithubPullRequest,
	GitlabMergeRequestRelation_$gitlabMergeRequestData,
	ProjectAsanaTask_$all,
	ProjectJiraIssue_$all,
	ProjectLinearIssue_$all,
	ProjectSlackMessage_$all,
} from '@-/database/selections';
import { DocumentNotFoundError } from '@-/errors';
import { ApiGithub } from '@-/github-integration/api';
import { ApiGitlab } from '@-/gitlab-integration/api';
import { ApiJira } from '@-/jira-integration/api';
import { ApiLinear } from '@-/linear-integration/api';
import { $try, err, ok } from 'errok';

export const ApiProjectCommentThread_unresolve = ({
	projectCommentThreadId,
}: {
	projectCommentThreadId: Id<'ProjectCommentThread'>;
}) => ($try(async function*() {
	yield* ApiConvex.v.ProjectCommentThread.update({
		input: {
			id: projectCommentThreadId,
			updates: {
				resolvedByUser: null,
			},
		},
	}).safeUnwrap();

	const projectCommentThread = yield* ApiConvex.v.ProjectCommentThread.get(
		{
			from: { id: projectCommentThreadId },
			include: {
				project: {
					include: {
						organization: true,
						githubPullRequestRelations: {
							include: {
								githubPullRequest: true,
							},
						},
						gitlabMergeRequestRelations: {
							include: getInclude(
								GitlabMergeRequestRelation_$gitlabMergeRequestData,
							),
						},
					},
				},
				gitMetadata_: true,
			},
		},
	).safeUnwrap();

	if (projectCommentThread === null) {
		return err(new DocumentNotFoundError('ProjectCommentThread'));
	}

	const {
		project,
		gitMetadata_,
	} = projectCommentThread;

	if (project.organization.githubOrganization && gitMetadata_?.branchName) {
		yield* ApiGithub.updatePullRequestComment({
			installationId: project.organization.githubOrganization.id,
			currentBranch: gitMetadata_.branchName,
			githubPullRequestRelations: project.githubPullRequestRelations,
		}).safeUnwrap();
	}

	if (
		gitMetadata_?.branchName && project.gitlabMergeRequestRelations.length > 0
	) {
		yield* ApiGitlab.updateMergeRequest({
			currentBranch: gitMetadata_.branchName,
			gitlabMergeRequestRelations: project.gitlabMergeRequestRelations,
			organization: project.organization,
		}).safeUnwrap();
	}

	return ok();
}));

export const ApiProjectCommentThread_resolve = ({
	commentThreadId,
	resolvedByUserId,
	shouldRunSideEffects,
}: {
	commentThreadId: Id<'ProjectCommentThread'>;
	resolvedByUserId: Id<'User'>;
	shouldRunSideEffects: boolean;
}) => ($try(async function*() {
	yield* ApiConvex.v.ProjectCommentThread.update({
		input: {
			id: commentThreadId,
			updates: {
				resolvedByUser: resolvedByUserId,
			},
		},
	}).safeUnwrap();

	const projectCommentThread = yield* ApiConvex.v.ProjectCommentThread.get({
		from: { id: commentThreadId },
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
					gitlabMergeRequestRelations: {
						include: getInclude(
							GitlabMergeRequestRelation_$gitlabMergeRequestData,
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
		},
	}).safeUnwrap();

	if (projectCommentThread === null) {
		return err(new DocumentNotFoundError('ProjectCommentThread'));
	}

	const organizationId = projectCommentThread.project.organization._id;
	const organizationMember = yield* ApiConvex.v.OrganizationMember.get({
		from: {
			organization: organizationId,
			user: resolvedByUserId,
		},
		include: {
			organization: {
				include: {
					linearOrganization: true,
				},
			},
		},
	}).safeUnwrap();

	if (organizationMember !== null && shouldRunSideEffects) {
		if (projectCommentThread.jiraIssueRelation) {
			yield* ApiJira.resolveIssue({
				organizationMemberId: organizationMember._id,
				issueId:
					projectCommentThread.jiraIssueRelation.projectJiraIssue.issueId,
			}).safeUnwrap();
		}

		if (
			projectCommentThread.linearIssueRelation &&
			organizationMember.organization.linearOrganization &&
			organizationMember.organization.linearOrganization.access_token &&
			projectCommentThread.linearIssueRelation.projectLinearIssue.team
		) {
			const linearClient = yield* ApiLinear.getClient({
				organizationMemberId: organizationMember._id,
			}).safeUnwrap();

			const states = (
				await linearClient.workflowStates({
					filter: {
						team: {
							id: {
								in: [
									projectCommentThread.linearIssueRelation
										.projectLinearIssue
										.team.id,
								],
							},
						},
					},
				})
			).nodes;

			const doneState = states.find((state) => state.name === 'Done');

			if (doneState) {
				await linearClient.updateIssue(
					projectCommentThread.linearIssueRelation.projectLinearIssue.issueId,
					{
						stateId: doneState.id,
					},
				);
			}
		}

		if (projectCommentThread.asanaTaskRelation) {
			yield* ApiAsana.resolveTask({
				organizationMemberId: organizationMember._id,
				taskId: projectCommentThread.asanaTaskRelation.projectAsanaTask.gid,
			}).safeUnwrap();
		}
	}

	if (
		projectCommentThread.project.organization.githubOrganization &&
		projectCommentThread.gitMetadata_?.branchName
	) {
		yield* ApiGithub.updatePullRequestComment({
			installationId:
				projectCommentThread.project.organization.githubOrganization.id,
			currentBranch: projectCommentThread.gitMetadata_.branchName,
			githubPullRequestRelations:
				projectCommentThread.project.githubPullRequestRelations,
		}).safeUnwrap();
	}

	if (
		projectCommentThread.gitMetadata_?.branchName &&
		projectCommentThread.project.gitlabMergeRequestRelations.length > 0
	) {
		yield* ApiGitlab.updateMergeRequest({
			currentBranch: projectCommentThread.gitMetadata_.branchName,
			gitlabMergeRequestRelations:
				projectCommentThread.project.gitlabMergeRequestRelations,
			organization: projectCommentThread.project.organization,
		}).safeUnwrap();
	}

	return ok();
}));
