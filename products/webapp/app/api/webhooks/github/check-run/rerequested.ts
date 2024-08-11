import { ApiConvex } from '@-/convex/api';
import type { ServerDoc } from '@-/database';
import type { Project_$organizationAndCommentThreads } from '@-/database/selections';
import { ApiGithub } from '@-/github-integration/api';
import { ApiProjectCommentThread } from '@-/project-comment-thread/api';
import type { CheckRunRerequestedEvent } from '@octokit/webhooks-types';
import { NextResponse } from 'next/server';

export async function handleCheckRunRerequested({
	body,
	projects,
	githubOrganizationId,
}: {
	body: CheckRunRerequestedEvent;
	projects: ServerDoc<typeof Project_$organizationAndCommentThreads>[];
	githubOrganizationId: number;
}) {
	const octokit = ApiGithub.getOctokitAuthApp({
		installationId: String(githubOrganizationId),
	});

	const { check_run } = body;
	const { pull_requests } = check_run;
	const pull_request = pull_requests[0];

	if (!pull_request) {
		return NextResponse.json({
			message: 'No github pull request to sync',
		}, { status: 200 });
	}

	const githubPullRequest = await ApiConvex.v.GithubPullRequest.get({
		from: { pullRequestId: pull_request.id },
		include: {},
	}).unwrapOrThrow();

	if (githubPullRequest === null) {
		return NextResponse.json(
			{ message: 'No database pull request to sync' },
			{
				status: 200,
			},
		);
	}

	const { unresolvedComments, resolvedComments } = ApiProjectCommentThread
		.createMarkdownMessage({
			baseUrl: 'https://tunnel.dev',
			branchName: pull_request.head.ref,
			projects,
		});

	await octokit.request(
		'PATCH /repos/{owner}/{repo}/check-runs/{check_run_id}',
		{
			owner: githubPullRequest.ownerLogin,
			repo: githubPullRequest.repoName,
			check_run_id: check_run.id,
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
