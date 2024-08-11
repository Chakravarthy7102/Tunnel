import { ApiGithub } from '#api';
import { ApiConvex } from '@-/convex/api';
import type { ServerDoc } from '@-/database';
import type { GithubPullRequestRelation_$allGithubPullRequest } from '@-/database/selections';
import { RELEASE } from '@-/env/app';
import { ApiUrl } from '@-/url/api';
import { getTimeZones } from '@vvo/tzdb';
import { $try, ok, ResultAsync } from 'errok';
import { outdent } from 'outdent';

export function ApiGithub_updatePullRequestComment({
	installationId,
	githubPullRequestRelations,
	currentBranch,
}: {
	installationId: number;
	githubPullRequestRelations: ServerDoc<
		typeof GithubPullRequestRelation_$allGithubPullRequest
	>[];
	currentBranch: string;
}) {
	const octokit = ApiGithub.getOctokitAuthApp({
		installationId: String(installationId),
	});
	return ResultAsync.combinePromises(
		githubPullRequestRelations.map(async (githubPullRequestRelation) =>
			$try(async function*() {
				const { githubPullRequest } = githubPullRequestRelation;

				const senderUser = githubPullRequest.senderId === null ?
					null :
					await ApiConvex.v.User.get({
						from: { githubAccountUserId: githubPullRequest.senderId },
						include: {},
					}).unwrapOr(null);
				const timezoneIdentifier = senderUser?.timezone ?? 'UTC';
				const timezone = getTimeZones({ includeUtc: true }).find((tz) =>
					tz.name === timezoneIdentifier
				) ?? { name: 'UTC', abbreviation: 'UTC' };

				if (
					githubPullRequest.isOpen &&
					githubPullRequest.branch === currentBranch
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
							githubRepositoryId: githubPullRequest.repoId,
						},
						paginationOpts: {
							numItems: 100,
							cursor: null,
						},
					}).safeUnwrap();

					let resolvedComments = 0;
					let unresolvedComments = 0;

					const comment = outdent`
						**The latest updates on your projects**. Learn more about [Tunnel ↗︎](https://tunnel.dev)
						| Project | Status | Link | Updated (${timezone.abbreviation}) |
						| :--- | :----- | :------ | :------ |
						${
						projects
							.map((project) => {
								const commentThreads = project.commentThreads.filter(
									(commentThread) =>
										commentThread.gitMetadata_?.branchName ===
											githubPullRequest.branch,
								);

								let latestThread = commentThreads[0];
								let updatedAt = new Date().toLocaleString('en-US', {
									timeZone: timezone.name,
									month: 'short',
									day: 'numeric',
									year: 'numeric',
									hour: 'numeric',
									minute: 'numeric',
									hour12: true,
								});

								if (latestThread !== undefined) {
									for (const thread of commentThreads) {
										if (thread.updatedAt > latestThread.updatedAt) {
											latestThread = thread;
										}
									}

									updatedAt = new Date(latestThread.updatedAt)
										.toLocaleString(
											'en-US',
											{
												timeZone: 'UTC',
												month: 'short',
												day: 'numeric',
												year: 'numeric',
												hour: 'numeric',
												minute: 'numeric',
												hour12: true,
											},
										);

									resolvedComments = commentThreads.filter(
										(thread) =>
											thread.resolvedByUser,
									).length;

									unresolvedComments = commentThreads.length - resolvedComments;
								}

								return `| **${project.name}** | ${
									unresolvedComments === 0 ?
										'✅ Ready' :
										`💬 ${unresolvedComments} unresolvedComments${
											resolvedComments !== 0 ?
												`<br />✅ ${resolvedComments} resolvedComments` :
												''
										}`
								} | [Visit Dashboard](${
									ApiUrl.getWebappUrl({
										fromRelease: RELEASE,
										withScheme: true,
									})
								}/${project.organization.slug}/projects/${project.slug}) | ${updatedAt} |\n`;
							})
							.join('')
					}
					`;

					if (githubPullRequest.checkRunId !== null) {
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
					}

					await octokit.request(
						'PATCH /repos/{owner}/{repo}/issues/comments/{comment_id}',
						{
							comment_id: githubPullRequest.commentId,
							owner: githubPullRequest.ownerLogin,
							repo: githubPullRequest.repoName,
							body: comment,
						},
					);
				}

				return ok();
			})
		),
	);
}
