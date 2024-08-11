import { ApiConvex } from '@-/convex/api';
import type { ServerDoc } from '@-/database';
import type { Project_$organizationAndCommentThreads } from '@-/database/selections';
import { ApiGithub } from '@-/github-integration/api';
import { logger } from '@-/logger';
import { ApiProjectCommentThread } from '@-/project-comment-thread/api';
import type { PullRequestOpenedEvent } from '@octokit/webhooks-types';
import { NextResponse } from 'next/server';

export async function handlePullRequestOpened({
	body,
	projects,
	githubOrganizationId,
	baseUrl,
}: {
	body: PullRequestOpenedEvent;
	projects: ServerDoc<typeof Project_$organizationAndCommentThreads>[];
	baseUrl: string;
	githubOrganizationId: number;
}) {
	const octokit = ApiGithub.getOctokitAuthApp({
		installationId: String(githubOrganizationId),
	});

	const { pull_request, repository, sender } = body;
	const issueNumber = Number(pull_request.issue_url.split('/').pop());

	const { message, resolvedComments, unresolvedComments } =
		ApiProjectCommentThread.createMarkdownMessage({
			baseUrl,
			branchName: pull_request.head.ref,
			projects,
		});

	const { data } = await octokit.request(
		'POST /repos/{owner}/{repo}/issues/{issue_number}/comments',
		{
			owner: repository.owner.login,
			repo: repository.name,
			body: message,
			issue_number: issueNumber,
		},
	);

	const { data: checkRunData } = await octokit.request(
		'POST /repos/{owner}/{repo}/check-runs',
		{
			owner: repository.owner.login,
			repo: repository.name,
			name: 'Tunnel Feedback',
			head_sha: pull_request.head.sha,
			status: 'completed',
			conclusion: unresolvedComments > 0 ? 'failure' : 'success',
			output: {
				title: unresolvedComments > 0 ?
					'❌ Unresolved feedback' :
					'✅ No unresolved feedback',
				summary:
					`💬 ${unresolvedComments} unresolved, ${resolvedComments} resolved.`,
			},
		},
	);

	const pullRequest = await ApiConvex.v.GithubPullRequest.create({
		input: {
			data: {
				branch: pull_request.head.ref,
				commentId: data.id,
				isOpen: true,
				issueNumber,
				ownerLogin: repository.owner.login,
				repoName: repository.name,
				pullRequestId: pull_request.id,
				repoId: repository.id,
				senderId: sender.id,
				checkRunId: checkRunData.id,
			},
			include: {},
		},
	}).unwrapOrThrow();

	await Promise.all(
		projects.map(async (project) => {
			const result = await ApiConvex.v.GithubPullRequestRelation.create(
				{
					input: {
						data: {
							githubPullRequest: pullRequest._id,
							project: project._id,
						},
						include: {},
					},
				},
			);

			if (result.isErr()) {
				logger.error(
					'Failed to create a Github Pull Request database entry:',
					result.error,
				);
			}
		}),
	);

	return NextResponse.json(pullRequest, { status: 200 });
}
