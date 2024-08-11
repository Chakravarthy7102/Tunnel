#!/usr/bin/env tsx

import { cli } from '@-/cli-helpers';
import { env } from '@-/env';
import { packageDirpaths } from '@-/packages-config';
import fs from 'node:fs';
import path from 'pathe';

if (!(await cli.pnpm.exists())) {
	await cli.pnpm.install();
}

if (!fs.existsSync(path.join(packageDirpaths.database, '.env.local'))) {
	process.stdout.write(
		'Setting up Convex locally (note: make sure to select your personal convex organization)...\n',
	);

	const convexBinFilepath = path.join(
		packageDirpaths.database,
		'node_modules/.bin/convex',
	);
	await cli.execa(convexBinFilepath, ['dev', '--once'], {
		cwd: packageDirpaths.database,
		stdio: 'inherit',
	});

	process.stdout.write(
		`Make sure to add the following CONVEX_SECRET environment variable to your Convex deployment:\n${
			env('CONVEX_SECRET')
		}`,
	);
}
