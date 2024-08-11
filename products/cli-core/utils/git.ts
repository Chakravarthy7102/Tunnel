import { logger } from '@-/logger';
import { execa } from 'execa';
import { findUp } from 'find-up';

export async function getLocalProjectGitDirpath({
	localProjectRootDirpath,
}: {
	localProjectRootDirpath: string;
}): Promise<string | null> {
	const gitDirpath = await findUp('.git', {
		cwd: localProjectRootDirpath,
		type: 'directory',
	});
	return gitDirpath ?? null;
}

export async function getLocalProjectGitUrl({
	localProjectRootDirpath,
}: {
	localProjectRootDirpath: string;
}): Promise<string | null> {
	try {
		const { stdout: gitRemoteOriginUrl } = await execa(
			'git',
			['config', '--get', 'remote.origin.url'],
			{
				stdout: 'pipe',
				cwd: localProjectRootDirpath,
			},
		);

		let remoteHost: string;
		const repositoryPathslug = gitRemoteOriginUrl.match(/[A-Za-z-]+\/[^/]+$/)
			?.[0];
		if (repositoryPathslug === undefined) {
			throw new Error(
				`Could not infer repository pathslug from URL ${gitRemoteOriginUrl}`,
			);
		}

		if (gitRemoteOriginUrl.includes('@')) {
			const remoteHostOrUndefined = gitRemoteOriginUrl.match(/@([^:]+):/)?.[1];
			if (remoteHostOrUndefined === undefined) {
				throw new Error(
					`Could not infer remote host from URL ${gitRemoteOriginUrl}`,
				);
			}

			remoteHost = remoteHostOrUndefined;
		} else if (gitRemoteOriginUrl.includes('://')) {
			const remoteHostOrUndefined = gitRemoteOriginUrl.match(/:\/\/([^/]+)\//)
				?.[1];
			if (remoteHostOrUndefined === undefined) {
				throw new Error(
					`Could not infer remote host from URL ${gitRemoteOriginUrl}`,
				);
			}

			remoteHost = remoteHostOrUndefined;
		} else {
			throw new Error(
				`Could not infer remote host from URL ${gitRemoteOriginUrl}`,
			);
		}

		const gitUrl = `git://${remoteHost}/${repositoryPathslug}.git`;

		return gitUrl;
	} catch (error) {
		logger.debug('Failed to infer git url from working directory:', error);
		return null;
	}
}
