#!/usr/bin/env tsx

import { cli } from '@-/cli-helpers';
import { packageDirpaths } from '@-/packages-config';
import { buildTests } from './utils/build.ts';
import { setupTunnelLocally } from './utils/setup.ts';
import { testAbsoluteFilepaths } from './utils/test-files.ts';

process.env.TEST = '1';

await buildTests();
await setupTunnelLocally();

await cli.pnpm(['exec', 'artillery', 'run', ...testAbsoluteFilepaths], {
	stdio: 'inherit',
	cwd: packageDirpaths.loadTesting,
});

process.exit(0);
