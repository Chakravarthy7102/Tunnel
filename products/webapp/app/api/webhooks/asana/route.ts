import { ApiAsana } from '@-/asana-integration/api';
import { ApiConvex } from '@-/convex/api';
import { ApiProjectCommentThread } from '@-/project-comment-thread/api';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
	const body = await request.json();
	const asanaHookSecret = request.headers.get('X-Hook-Secret');

	if (asanaHookSecret) {
		return Response.json({ success: true }, {
			status: 200,
			headers: {
				'X-Hook-Secret': asanaHookSecret,
			},
		});
	}

	const event = body.events[0];

	const projectCommentThread = await ApiConvex.v.ProjectCommentThread.get({
		from: {
			projectAsanaTaskGid: event.resource.gid,
		},
		include: {
			organization: true,
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

	const organization = await ApiConvex.v.Organization.get({
		from: { id: projectCommentThread.organization._id },
		include: {},
	}).unwrapOrThrow();

	if (organization === null) {
		return NextResponse.json(
			{ message: 'Organization not found' },
			{ status: 404 },
		);
	}

	const organizationMember = await ApiConvex.v.OrganizationMember.get({
		from: { user: authorUserId, organization: organization._id },
		include: {},
	}).unwrapOrThrow();

	if (organizationMember === null) {
		return NextResponse.json(
			{
				message: 'No organization member found',
			},
			{ status: 404 },
		);
	}

	switch (event.action) {
		case 'changed': {
			const asanaClient = await ApiAsana.getClient({
				organizationMemberId: organizationMember._id,
			}).unwrapOrThrow();

			const task = await asanaClient.tasks.findById(
				event.resource.gid,
			);

			if (
				task.completed
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

		case 'deleted':
		case 'removed': {
			await ApiProjectCommentThread.delete({
				input: {
					id: commentThreadId,
				},
			}).unwrapOrThrow();
			break;
		}

		default:
	}

	return NextResponse.json({ success: true }, { status: 200 });
}
