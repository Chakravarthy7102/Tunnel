import type { ProjectGitMetadata } from '#types';
import { ApiConvex } from '@-/convex/api';
import { ApiGithub } from '@-/github-integration/api';
import { type Errors, withErrors } from '@-/with-errors';

export const getProjectGitMetadata = withErrors(
	{
		project_not_found: 'The specified project could not be found',
		project_does_not_have_github_repository:
			'The project does not have an associated GitHub repository',
		organization_does_not_have_github_app_installation:
			"The project's organization has not enabled the GitHub integration",
		invalid_github_repository_name:
			"The name of the project's GitHub repository was invalid",
		branch_not_found: 'The specified branch could not be found',
		branch_not_specified: 'The branch was not specified',
		project_not_specified: 'The project was not specified',
	},
	(errors) =>
	async ({
		projectSlug,
		branchName,
	}: {
		projectSlug: string;
		branchName: string;
	}): Promise<{
		data: ProjectGitMetadata | null;
		errors: Errors<typeof errors>;
	}> => {
		const project = await ApiConvex.v.Project.get({
			from: { slug: projectSlug },
			include: {
				organization: true,
			},
		}).unwrapOrThrow();

		if (project === null) {
			return {
				data: null,
				errors: [errors.project_not_found],
			};
		}

		if (project.githubRepository === null) {
			return {
				data: {
					branch: {
						name: branchName,
					},
					gitUrl: null,
					latestCommit: null,
				},
				errors: [errors.project_does_not_have_github_repository],
			};
		}

		if (project.organization.githubOrganization === null) {
			return {
				data: {
					branch: {
						name: branchName,
					},
					gitUrl: null,
					latestCommit: null,
				},
				errors: [errors.organization_does_not_have_github_app_installation],
			};
		}

		const octokit = ApiGithub.getOctokitAuthApp({
			installationId: String(project.organization.githubOrganization.id),
		});

		const [owner, repo] = project.githubRepository.full_name.split('/');
		if (owner === undefined || repo === undefined) {
			return {
				data: {
					branch: {
						name: branchName,
					},
					gitUrl: null,
					latestCommit: null,
				},
				errors: [errors.invalid_github_repository_name],
			};
		}

		try {
			const {
				data: { commit: latestCommit },
			} = await octokit.request(
				'GET /repos/{owner}/{repo}/branches/{branch}',
				{
					owner,
					repo,
					branch: branchName,
				},
			);

			return {
				data: {
					branch: {
						name: branchName,
					},
					gitUrl: project.organization.githubOrganization.html_url,
					latestCommit: {
						sha: latestCommit.sha,
						message: latestCommit.commit.message,
					},
				},
				errors: [],
			};
		} catch (error: unknown) {
			if (
				typeof error === 'object' &&
				error !== null &&
				'status' in error &&
				error.status === 404
			) {
				return {
					data: {
						branch: {
							name: branchName,
						},
						gitUrl: project.organization.githubOrganization.html_url,
						latestCommit: null,
					},
					errors: [errors.branch_not_found],
				};
			}

			throw error;
		}
	},
);
