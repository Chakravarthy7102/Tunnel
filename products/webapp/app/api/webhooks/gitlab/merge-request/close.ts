import { ApiConvex } from '@-/convex/api';
import { NextResponse } from 'next/server';

export async function handleMergeRequestClose({
	mergeRequestId,
}: {
	mergeRequestId: number;
}) {
	const gitlabMergeRequest = await ApiConvex.v.GitlabMergeRequest.get({
		from: {
			mergeRequestId,
		},
		include: {},
	}).unwrapOrThrow();

	if (!gitlabMergeRequest) {
		return NextResponse.json({
			message: 'No linked merge request on Tunnel',
		}, {
			status: 200,
		});
	}

	await ApiConvex.v.GitlabMergeRequest.update({
		input: {
			id: gitlabMergeRequest._id,
			updates: {
				isOpen: false,
			},
		},
	}).unwrapOrThrow();

	return NextResponse.json({
		message: 'Successfully updated merge request on Tunnel',
	}, {
		status: 200,
	});
}
