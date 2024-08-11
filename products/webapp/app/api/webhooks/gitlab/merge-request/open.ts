import { ApiConvex } from '@-/convex/api';
import type { Id, ServerDoc } from '@-/database';
import type { Project_$organizationAndCommentThreads } from '@-/database/selections';
import { RELEASE } from '@-/env/app';
import { ApiGitlab } from '@-/gitlab-integration/api';
import { ApiProjectCommentThread } from '@-/project-comment-thread/api';
import { ApiUrl } from '@-/url/api';
import { NextResponse } from 'next/server';

export async function handleMergeRequestOpen({
	gitlabProjectId,
	branchName,
	projects,
	mergeRequestIid,
	mergeRequestId,
	organizationMemberId,
	commitSha,
}: {
	gitlabProjectId: number;
	branchName: string;
	projects: ServerDoc<typeof Project_$organizationAndCommentThreads>[];
	mergeRequestIid: number;
	mergeRequestId: number;
	organizationMemberId: Id<'OrganizationMember'>;
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

	const note = await ApiGitlab.createNote({
		organizationMemberId,
		gitlabProjectId,
		mergeRequestIid,
		message,
	}).unwrapOrThrow();

	const gitlabMergeRequest = await ApiConvex.v.GitlabMergeRequest.create({
		input: {
			data: {
				authorOrganizationMember: organizationMemberId,
				isOpen: true,
				mergeRequestId,
				mergeRequestIid,
				noteId: note.id,
				sourceBranch: branchName,
				latestCommitSha: commitSha,
				projectId: gitlabProjectId,
			},
			include: {},
		},
	}).unwrapOrThrow();

	await Promise.all(
		projects.map(async (project) =>
			ApiConvex.v.GitlabMergeRequestRelation.create({
				input: {
					data: {
						project: project._id,
						gitlabMergeRequest: gitlabMergeRequest._id,
					},
					include: {},
				},
			}).unwrapOrThrow()
		),
	);

	await ApiGitlab.checkCommitStatus({
		state: unresolvedComments === 0 ? 'success' : 'failed',
		sourceBranch: branchName,
		organizationMemberId,
		commitSha,
		gitlabProjectId,
	}).unwrapOrThrow();

	return NextResponse.json(note, { status: 200 });
}
