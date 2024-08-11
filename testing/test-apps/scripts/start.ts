#!/usr/bin/env tsx

import { startTestAppsServer } from '#utils/server.ts';
import { cli } from '@-/cli-helpers';
import { packageDirpaths } from '@-/packages-config';
import path from 'pathe';

await startTestAppsServer();

const mprocsBinFilepath = path.join(
	packageDirpaths.localDevelopment,
	'node_modules/.bin/mprocs',
);
await cli.execa(
	mprocsBinFilepath,
	['-c', path.join(packageDirpaths.testApps, 'generated/mprocs.yaml')],
	{
		cwd: packageDirpaths.monorepo,
		stdio: 'inherit',
	},
);

process.exit(0);
