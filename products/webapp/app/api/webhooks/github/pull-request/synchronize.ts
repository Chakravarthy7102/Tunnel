import { ApiConvex } from '@-/convex/api';
import type { ServerDoc } from '@-/database';
import type { Project_$organizationAndCommentThreads } from '@-/database/selections';
import { ApiGithub } from '@-/github-integration/api';
import type { PullRequestSynchronizeEvent } from '@octokit/webhooks-types';
import { NextResponse } from 'next/server';

export async function handlePullRequestSynchronize({
	body,
	projects,
	githubOrganizationId,
}: {
	body: PullRequestSynchronizeEvent;
	projects: ServerDoc<typeof Project_$organizationAndCommentThreads>[];
	githubOrganizationId: number;
}) {
	const octokit = ApiGithub.getOctokitAuthApp({
		installationId: String(githubOrganizationId),
	});

	const { pull_request } = body;

	const githubPullRequest = await ApiConvex.v.GithubPullRequest.get({
		from: { pullRequestId: pull_request.id },
		include: {},
	}).unwrapOrThrow();

	if (githubPullRequest?.checkRunId === null) {
		return NextResponse.json(
			{ message: 'No check to sync' },
			{
				status: 200,
			},
		);
	}

	if (githubPullRequest === null) {
		return NextResponse.json(
			{ message: 'No database pull request to sync' },
			{
				status: 200,
			},
		);
	}

	let resolvedComments = 0;
	let unresolvedComments = 0;

	for (const project of projects) {
		const commentThreads = project.commentThreads.filter(
			(commentThread) =>
				commentThread.gitMetadata_?.branchName ===
					pull_request.head.ref,
		);

		let latestThread = commentThreads[0];

		if (latestThread !== undefined) {
			for (const thread of commentThreads) {
				if (thread.updatedAt > latestThread.updatedAt) {
					latestThread = thread;
				}
			}

			resolvedComments = commentThreads.filter(
				(thread) => thread.resolvedByUser,
			).length;

			unresolvedComments = commentThreads.length - resolvedComments;
		}
	}

	await octokit.request(
		'PATCH /repos/{owner}/{repo}/check-runs/{check_run_id}',
		{
			owner: githubPullRequest.ownerLogin,
			repo: githubPullRequest.repoName,
			check_run_id: githubPullRequest.checkRunId,
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

	return NextResponse.json({ message: 'Check run updated' }, {
		status: 200,
	});
}
