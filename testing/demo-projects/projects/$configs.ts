import type { ProjectConfig } from '#types';
import { packageDirpaths } from '@-/packages-config';
import mapObject from 'map-obj';
import path from 'pathe';
import demoProjectConfigFiles from './_.ts';

export const demoProjectConfigs = mapObject(
	demoProjectConfigFiles,
	(relativeFilepath, config) => [
		path.basename(path.dirname(relativeFilepath)),
		{
			...config.default,
			fixtureDirpath: path.join(
				packageDirpaths.monorepo,
				path.dirname(relativeFilepath),
				'fixture',
			),
		},
	],
) as {
	[
		K in keyof typeof demoProjectConfigFiles as K extends
			`testing/demo-projects/projects/${infer ProjectSlug}/$config.ts` ?
			ProjectSlug :
			never
	]: ProjectConfig;
};
