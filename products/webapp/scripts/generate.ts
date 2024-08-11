#!/usr/bin/env tsx

import { cli } from '@-/cli-helpers';
import { packageDirpaths } from '@-/packages-config';

await cli.pnpm('exec basehub', { cwd: packageDirpaths.webapp });
