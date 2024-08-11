#!/usr/bin/env tsx

import { cli } from '@-/cli-helpers';
import { packageDirpaths } from '@-/packages-config';

await cli.pnpm(
	'convex deploy --cmd-url-env-var-name CONVEX_URL --cmd "pnpm webapp/build"',
	{
		env: {
			NODE_OPTIONS: '--max_old_space_size=16384',
		},
		cwd: packageDirpaths.database,
		stdio: 'inherit',
	},
);
