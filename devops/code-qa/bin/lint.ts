#!/usr/bin/env tsx

import { packageDirpaths } from '@-/packages-config';
import { createRequire } from 'node:module';
import path from 'pathe';
import invariant from 'tiny-invariant';

const __require = createRequire(import.meta.url);
const eslintBinPath = path.join(
	path.dirname(__require.resolve('eslint/package.json')),
	'bin/eslint.js',
);

process.chdir(packageDirpaths.monorepo);
invariant(process.argv[0] !== undefined, 'process.argv[0] exists');
process.argv = [
	process.argv[0],
	eslintBinPath,
	'--cache',
	...(process.argv.includes('--fix') ? ['--fix'] : []),
	'.',
];

__require(eslintBinPath);
