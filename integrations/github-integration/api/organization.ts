import { ApiGithub } from '#api';
import type { GithubOrganization } from '#types';

export async function ApiGithub_getGithubOrganization(
	{ installationId }: { installationId: number },
): Promise<GithubOrganization | null> {
	const octokit = ApiGithub.getOctokitAuthApp({
		installationId: String(installationId),
	});

	const response = await octokit.request(
		'GET /app/installations/{installation_id}',
		{ installation_id: installationId },
	);

	const { account, html_url, id, target_type } = response.data;
	if (!account || !('login' in account)) {
		return null;
	}

	const { login, avatar_url, html_url: account_url } = account;

	return {
		type: target_type,
		account: {
			avatar_url,
			html_url: account_url,
			login,
		},
		html_url,
		id,
	};
}
