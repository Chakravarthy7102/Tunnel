import { ApiConvex } from '@-/convex/api';
import type { PullRequestClosedEvent } from '@octokit/webhooks-types';
import { NextResponse } from 'next/server';

export async function handlePullRequestClosed({
	body,
}: {
	body: PullRequestClosedEvent;
}) {
	const { pull_request } = body;

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

	(await ApiConvex.v.GithubPullRequest.update({
		input: {
			id: githubPullRequest._id,
			updates: {
				isOpen: false,
			},
		},
	})).unwrapOrThrow();

	return NextResponse.json(
		{ message: 'Closed database pull request' },
		{ status: 200 },
	);
}
