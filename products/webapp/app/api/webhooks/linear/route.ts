import { ApiConvex } from '@-/convex/api';
import { ApiProjectCommentThread } from '@-/project-comment-thread/api';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
	const body = await request.json();

	if (body.type !== 'Issue') {
		return NextResponse.json(
			{
				message: "We don't handle this yet",
			},
			{ status: 501 },
		);
	}

	const projectCommentThread = await ApiConvex.v.ProjectCommentThread.get({
		from: {
			projectLinearIssueId: body.data.id,
		},
		include: {
			resolvedByUser: true,
			comments: {
				include: {
					authorUser: true,
				},
			},
		},
	}).unwrapOrThrow();

	if (projectCommentThread === null) {
		return NextResponse.json(
			{
				message: 'No comment thread attached',
			},
			{ status: 404 },
		);
	}

	const firstComment = projectCommentThread.comments[0];

	if (!firstComment) {
		return NextResponse.json(
			{ message: 'No comment thread attached' },
			{ status: 500 },
		);
	}

	if (!firstComment.authorUser) {
		return NextResponse.json(
			{
				message: 'No comment thread attached',
			},
			{ status: 404 },
		);
	}

	const authorUserId = firstComment.authorUser._id;
	const commentThreadId = projectCommentThread._id;

	switch (body.action) {
		case 'update': {
			if (
				(body.data.state.type === 'completed' ||
					body.data.state.type === 'canceled')
			) {
				await ApiProjectCommentThread.resolve({
					commentThreadId,
					resolvedByUserId: authorUserId,
					shouldRunSideEffects: false,
				}).unwrapOrThrow();
			} else {
				await ApiProjectCommentThread.unresolve({
					projectCommentThreadId: commentThreadId,
				}).unwrapOrThrow();
			}

			break;
		}

		case 'remove': {
			await ApiProjectCommentThread.delete({
				input: {
					id: commentThreadId,
				},
			}).unwrapOrThrow();
			break;
		}

		default:
	}

	return NextResponse.json(body, { status: 200 });
}
