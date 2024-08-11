#!/usr/bin/env tsx

import { createTunnelProject } from '#test/utils/project.ts';
import { cli } from '@-/cli-helpers';
import { packageDirpaths } from '@-/packages-config';
import dotenv from 'dotenv';
import path from 'pathe';

dotenv.config({
	path: path.join(packageDirpaths.database, '.env.local'),
	override: true,
});
dotenv.config({ path: path.join(packageDirpaths.monorepo, '.env') });

await createTunnelProject();
await cli.pnpm(
	[
		'exec',
		'http-server',
		path.join(
			packageDirpaths.tunnelInstancePageScript,
			'test/fixtures/html-page',
		),
	],
	{ cwd: packageDirpaths.tunnelInstancePageScript, stdio: 'inherit' },
);
