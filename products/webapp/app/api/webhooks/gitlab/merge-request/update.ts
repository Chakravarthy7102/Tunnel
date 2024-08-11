import { ApiConvex } from '@-/convex/api';
import type { ServerDoc } from '@-/database';
import type { Project_$organizationAndCommentThreads } from '@-/database/selections';
import { RELEASE } from '@-/env/app';
import { ApiGitlab } from '@-/gitlab-integration/api';
import { ApiProjectCommentThread } from '@-/project-comment-thread/api';
import { ApiUrl } from '@-/url/api';
import { NextResponse } from 'next/server';

export async function handleMergeRequestUpdate({
	gitlabProjectId,
	branchName,
	projects,
	mergeRequestIid,
	mergeRequestId,
	commitSha,
}: {
	gitlabProjectId: number;
	branchName: string;
	projects: ServerDoc<typeof Project_$organizationAndCommentThreads>[];
	mergeRequestIid: number;
	mergeRequestId: number;
	commitSha: string;
}) {
	const { message, unresolvedComments } = ApiProjectCommentThread
		.createMarkdownMessage({
			baseUrl: ApiUrl.getWebappUrl({
				withScheme: true,
				fromRelease: RELEASE,
			}),
			branchName,
			projects,
		});

	const gitlabMergeRequest = await ApiConvex.v.GitlabMergeRequest.get({
		from: {
			mergeRequestId,
		},
		include: {
			authorOrganizationMember: true,
		},
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
				latestCommitSha: commitSha,
			},
		},
	}).unwrapOrThrow();

	const note = await ApiGitlab.updateNote({
		organizationMemberId: gitlabMergeRequest.authorOrganizationMember._id,
		noteId: gitlabMergeRequest.noteId,
		gitlabProjectId,
		mergeRequestIid,
		message,
	}).unwrapOrThrow();

	await ApiGitlab.checkCommitStatus({
		organizationMemberId: gitlabMergeRequest.authorOrganizationMember._id,
		state: unresolvedComments === 0 ? 'success' : 'failed',
		sourceBranch: branchName,
		commitSha,
		gitlabProjectId,
	}).unwrapOrThrow();

	return NextResponse.json(note, { status: 200 });
}
