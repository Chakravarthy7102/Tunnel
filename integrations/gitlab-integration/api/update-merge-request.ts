import { ApiConvex } from '@-/convex/api';
import type { ServerDoc } from '@-/database';
import type { GitlabMergeRequestRelation_$gitlabMergeRequestData } from '@-/database/selections';
import { RELEASE } from '@-/env/app';
import { ApiProjectCommentThread } from '@-/project-comment-thread/api';
import { ApiUrl } from '@-/url/api';
import { $try, ok, ResultAsync } from 'errok';
import { ApiGitlab } from './_.ts';

export const ApiGitlab_updateMergeRequest = (
	{ currentBranch, gitlabMergeRequestRelations, organization }: {
		currentBranch: string;
		gitlabMergeRequestRelations: ServerDoc<
			typeof GitlabMergeRequestRelation_$gitlabMergeRequestData
		>[];
		organization: ServerDoc<'Organization'>;
	},
) => (ResultAsync.combinePromises(
	gitlabMergeRequestRelations.map(async (gitlabMergeRequestRelation) =>
		$try(async function*() {
			const { gitlabMergeRequest } = gitlabMergeRequestRelation;

			if (
				gitlabMergeRequest.isOpen &&
				gitlabMergeRequest.sourceBranch === currentBranch
			) {
				const { page: projects } = yield* ApiConvex.v.Project.list({
					include: {
						commentThreads: {
							include: {
								gitMetadata_: true,
								resolvedByUser: true,
							},
						},
						organization: true,
					},
					where: {
						gitlabProjectId: gitlabMergeRequest.projectId,
						organization: organization._id,
					},
					paginationOpts: {
						numItems: 100,
						cursor: null,
					},
				}).safeUnwrap();

				const { message, unresolvedComments } = ApiProjectCommentThread
					.createMarkdownMessage({
						baseUrl: ApiUrl.getWebappUrl({
							fromRelease: RELEASE,
							withScheme: true,
						}),
						branchName: currentBranch,
						projects,
					});

				await ApiGitlab.updateNote({
					organizationMemberId: gitlabMergeRequest.authorOrganizationMember._id,
					noteId: gitlabMergeRequest.noteId,
					gitlabProjectId: gitlabMergeRequest.projectId,
					mergeRequestIid: gitlabMergeRequest.mergeRequestIid,
					message,
				}).unwrapOrThrow();

				await ApiGitlab.checkCommitStatus({
					organizationMemberId: gitlabMergeRequest.authorOrganizationMember._id,
					state: unresolvedComments === 0 ? 'success' : 'failed',
					sourceBranch: currentBranch,
					commitSha: gitlabMergeRequest.latestCommitSha,
					gitlabProjectId: gitlabMergeRequest.projectId,
				}).unwrapOrThrow();
			}

			return ok();
		})
	),
));
