import type { ProjectConfig } from '#types';

export function defineProjectConfig(
	projectConfig: Omit<ProjectConfig, 'fixtureDirpath'>,
) {
	return projectConfig;
}
