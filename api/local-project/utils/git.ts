import type { ProjectGitMetadata } from '@-/git-metadata';
import { logger } from '@-/logger';
import { execa } from 'execa';

async function getLocalProjectGitUrl({
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
			logger.debug(
				`Could not infer repository pathslug from URL ${gitRemoteOriginUrl}`,
			);
			return null;
		}

		if (gitRemoteOriginUrl.includes('@')) {
			const remoteHostOrUndefined = gitRemoteOriginUrl.match(/@([^:]+):/)?.[1];
			if (remoteHostOrUndefined === undefined) {
				logger.debug(
					`Could not infer remote host from URL ${gitRemoteOriginUrl}`,
				);
				return null;
			}

			remoteHost = remoteHostOrUndefined;
		} else if (gitRemoteOriginUrl.includes('://')) {
			const remoteHostOrUndefined = gitRemoteOriginUrl.match(/:\/\/([^/]+)\//)
				?.[1];
			if (remoteHostOrUndefined === undefined) {
				logger.debug(
					`Could not infer remote host from URL ${gitRemoteOriginUrl}`,
				);
				return null;
			}

			remoteHost = remoteHostOrUndefined;
		} else {
			logger.debug(
				`Could not infer remote host from URL ${gitRemoteOriginUrl}`,
			);
			return null;
		}

		const gitUrl = `git://${remoteHost}/${repositoryPathslug}.git`;

		return gitUrl;
	} catch (error) {
		logger.debug('Failed to get git url:', error);
		return null;
	}
}

async function getLocalProjectBranchName({
	localProjectRootDirpath,
}: {
	localProjectRootDirpath: string;
}) {
	try {
		// Try `git branch --show-current` first, since that works even if the branch doesn't have a commit
		const { stdout } = await execa('git', ['branch', '--show-current'], {
			stdio: 'pipe',
			cwd: localProjectRootDirpath,
		});

		return stdout;
	} catch {
		// Ignore the error, since it might be because the user has an older Git version (`--show-current` was added in 2.22)
	}

	try {
		const { stdout } = await execa(
			'git',
			['rev-parse', '--abbrev-ref', 'HEAD'],
			{ stdio: 'pipe', cwd: localProjectRootDirpath },
		);

		return stdout;
	} catch (error: unknown) {
		logger.debug('Unable to retrieve a git branch', error);
		return null;
	}
}

/**
	@returns null if the project isn't associated with a git repository
*/
export async function getLocalProjectGitMetadata({
	localProjectRootDirpath,
}: {
	localProjectRootDirpath: string;
}): Promise<ProjectGitMetadata | null> {
	const gitUrl = await getLocalProjectGitUrl({
		localProjectRootDirpath,
	});

	const branchName = await getLocalProjectBranchName({
		localProjectRootDirpath,
	});

	return {
		branch: branchName === null ? null : { name: branchName },
		latestCommit: null,
		gitUrl,
	};
}
