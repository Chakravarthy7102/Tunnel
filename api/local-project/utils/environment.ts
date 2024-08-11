import type { LocalProjectEnvironment } from '#types';
import { inferLocalProjectName } from '#utils/name.ts';
import type { Id } from '@-/database';
import type { ProjectGitMetadata } from '@-/git-metadata';

export async function getLocalProjectEnvironment({
	localProjectRootDirpath,
	localProjectWorkingDirpath,
	localTunnelProxyServerPortNumber,
	localServicePortNumber,
	tunnelCliSourceDirpath,
	providedProjectId,
	localProjectGitMetadata,
}: {
	localProjectRootDirpath: string;
	localProjectWorkingDirpath: string;
	localTunnelProxyServerPortNumber: number;
	localServicePortNumber: number;
	tunnelCliSourceDirpath: string;
	providedProjectId: string | null;
	localProjectGitMetadata: ProjectGitMetadata | null;
}): Promise<LocalProjectEnvironment> {
	const name = await inferLocalProjectName({
		localProjectRootDirpath,
	});

	return {
		name,
		gitMetadata: localProjectGitMetadata,
		rootDirpath: localProjectRootDirpath,
		workingDirpath: localProjectWorkingDirpath,
		providedProjectId: providedProjectId as Id<'Project'>,
		localServicePortNumber,
		localTunnelProxyServerPortNumber,
		tunnelCliSourceDirpath,
	};
}
