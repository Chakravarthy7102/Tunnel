#!/usr/bin/env tsx

import { packageDirpaths } from '@-/packages-config';
import { execa } from 'execa';
import path from 'pathe';

await execa('npm', ['publish', '--access=public'], {
	stdio: 'inherit',
	cwd: path.join(packageDirpaths.npmPackageDevelopment, '.build'),
});
