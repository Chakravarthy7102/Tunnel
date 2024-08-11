import { ApiGithub } from '#api';
import type { GithubRepository } from '#types';
import { ApiConvex } from '@-/convex/api';
import type { Id } from '@-/database';
import { DocumentNotFoundError } from '@-/errors';
import { unreachableCase } from '@tunnel/ts';
import { $try, err, ok, ResultAsync, type TryOk } from 'errok';

export const ApiGithub_listRepositories = ({ organizationId }: {
	organizationId: Id<'Organization'>;
}) => ($try(async function*() {
	const organization = yield* ApiConvex.v.Organization.get({
		from: { id: organizationId },
		include: {},
	}).safeUnwrap();

	if (organization === null) {
		return err(new DocumentNotFoundError('Organization'));
	}

	const { githubOrganization } = organization;

	if (githubOrganization === null) {
		return ok(null);
	}

	const octokit = ApiGithub.getOctokitAuthApp({
		installationId: String(githubOrganization.id),
	});

	// We need to use "/installation/repositories" since "/users/{username}/repos" doesn't list private repositories (https://stackoverflow.com/a/21909135/12581865)
	const getRepositoriesResponse = await octokit.request(
		'GET /installation/repositories',
		{
			type: 'all',
			per_page: 100,
		},
	);

	const repositories: GithubRepository[] = getRepositoriesResponse.data
		.repositories.map((repository) => ({
			id: repository.id,
			url: repository.url,
			git_url: repository.git_url,
			html_url: repository.html_url,
			full_name: repository.full_name,
		}));

	return ok(repositories);
}));

export const ApiGithub_getRepository = (
	args: {
		organizationId: Id<'Organization'>;
		repositoryId: string;
	} | {
		organizationId: Id<'Organization'>;
		owner: string;
		repo: string;
	},
) => ($try(async function*($ok: TryOk<GithubRepository | null>) {
	const organization = yield* ApiConvex.v.Organization.get({
		from: { id: args.organizationId },
		include: {},
	}).safeUnwrap();

	if (organization === null) {
		return err(new DocumentNotFoundError('Organization'));
	}

	const { githubOrganization } = organization;

	if (githubOrganization === null) {
		return $ok(null);
	}

	const installationId = githubOrganization.id;
	const octokit = ApiGithub.getOctokitAuthApp({
		installationId: String(installationId),
	});

	switch (true) {
		case 'repositoryId' in args: {
			const { repositoryId } = args;
			const response = yield* ResultAsync.fromPromise(
				octokit.request('GET /repositories/{id}', {
					id: repositoryId,
				}),
				(error) =>
					new Error(
						`Failed to retrieve GitHub repository: ${JSON.stringify(error)}`,
					),
			).safeUnwrap();

			const { id, full_name, git_url, html_url, url } = response.data;

			return $ok({
				id,
				full_name,
				git_url,
				html_url,
				url,
			});
		}

		case 'owner' in args: {
			const { owner, repo } = args;
			const getRepositoryResponse = yield* ResultAsync.fromPromise(
				octokit.request(
					'GET /repos/{owner}/{repo}',
					{
						owner,
						repo,
					},
				),
				(error) => new Error('Failed to get repository', { cause: error }),
			).safeUnwrap();

			const { id, url, git_url, html_url, full_name } =
				getRepositoryResponse.data;

			return $ok({
				id,
				url,
				git_url,
				html_url,
				full_name,
			});
		}

		default: {
			return unreachableCase(args);
		}
	}
}));
