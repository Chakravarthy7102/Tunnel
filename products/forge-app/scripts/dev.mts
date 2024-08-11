#!/usr/bin/env tsx

import { packageDirpaths } from '@-/packages-config';
import { createRequire } from 'node:module';
import path from 'pathe';

const forgeCliBinpath = path.join(
	packageDirpaths.forgeApp,
	'node_modules/@forge/cli/out/bin/cli.js',
);

process.argv = [
	...process.argv.slice(0, 2),
	'tunnel',
	...process.argv.slice(3),
];
createRequire(import.meta.url)(forgeCliBinpath);
