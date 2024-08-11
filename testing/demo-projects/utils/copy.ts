import { demoProjectConfigs } from '#projects/$configs.ts';
import fs from 'node:fs';
import tmp from 'tmp-promise';

export async function copyDemoProjectToTemporaryDirectory({
	projectKey,
}: {
	projectKey: keyof typeof demoProjectConfigs;
}): Promise<string> {
	const projectConfig = demoProjectConfigs[projectKey];
	const temporaryDir = await tmp.dir();

	await fs.promises.cp(projectConfig.fixtureDirpath, temporaryDir.path, {
		recursive: true,
	});

	return temporaryDir.path;
}
