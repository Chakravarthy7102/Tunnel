#!/usr/bin/env tsx

import { cli } from '@-/cli-helpers';
import { packageDirpaths } from '@-/packages-config';

await cli.pnpm('install', { cwd: packageDirpaths.monorepo, stdio: 'inherit' });
