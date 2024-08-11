import { ApiConvex } from '@-/convex/api';
import type { Selection } from '@-/database';
import { getInclude } from '@-/database/selection-utils';
import { DocumentNotFoundError, ProcedureError } from '@-/errors';
import { ApiGithub } from '@-/github-integration/api';
import { WebappApiInput } from '@-/webapp/api-input';
import { defineProcedure } from '@-/webapp/procedure-utils';
import { z } from '@-/zod';
import { $try, err, ok } from 'errok';
import type { EmptyObject } from 'type-fest';

export const projectCommentThread_getCommitDelta = defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.object({
			projectCommentThread: WebappApiInput.projectCommentThread({
				actor,
				actorRelation: 'hasProjectLivePreviewPermission',
			})(input, ctx),
		})),
	query: async ({ input }) => ($try(async function*() {
		const projectCommentThreadId = yield* input.projectCommentThread
			.safeUnwrap();
		const projectCommentThread = yield* ApiConvex.v.ProjectCommentThread.get({
			from: { id: projectCommentThreadId },
			include: {
				gitMetadata_: true,
				project: {
					include: {
						organization: true,
					},
				},
			},
		}).safeUnwrap();

		if (projectCommentThread === null) {
			return err(new DocumentNotFoundError('ProjectCommentThread'));
		}

		const {
			gitMetadata_: gitMetadata,
			project: {
				githubRepository,
				organization: { githubOrganization },
			},
		} = projectCommentThread;

		if (
			githubOrganization === null ||
			githubRepository === null ||
			!gitMetadata ||
			gitMetadata.branchName === null ||
			gitMetadata.commitSha === null
		) {
			return ok(null);
		}

		const octokit = ApiGithub.getOctokitAuthApp({
			installationId: String(githubOrganization.id),
		});

		const [owner, repo] = githubRepository.full_name.split('/');
		if (owner === undefined || repo === undefined) {
			return ok(null);
		}

		const {
			data: { commit: latestCommit },
		} = await octokit.request('GET /repos/{owner}/{repo}/branches/{branch}', {
			owner,
			repo,
			branch: gitMetadata.branchName,
		});

		const {
			data: { commits },
		} = await octokit.request(
			'GET /repos/{owner}/{repo}/compare/{base}...{head}',
			{
				owner,
				repo,
				base: gitMetadata.commitSha,
				head: latestCommit.sha,
			},
		);

		return ok(commits.length);
	})),
	error: ({ error }) =>
		new ProcedureError("Couldn't get commit information", error),
});

const buildGetProcedure = <$Selection extends Selection | EmptyObject>(
	selection: $Selection,
) => (defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.object({
			projectCommentThread: WebappApiInput.projectCommentThread({
				actor,
				actorRelation: 'hasProjectLivePreviewPermission',
			})(input, ctx),
		})),
	query: async ({ input }) => ($try(async function*() {
		const projectCommentThreadId = yield* input.projectCommentThread
			.safeUnwrap();
		return ApiConvex.v.ProjectCommentThread.get({
			from: { id: projectCommentThreadId },
			include: getInclude(selection),
		});
	})),
	error: ({ error }) => new ProcedureError("Couldn't get comment", error),
}));

export const projectCommentThread_get = buildGetProcedure({});
