#!/usr/bin/env tsx

import { APP_ENV } from '@-/env/app';
import { packageDirpaths } from '@-/packages-config';
import { build, buildPreset } from '@-/unbuild';
import type { Release } from '@tunnel/release';
import { program } from 'commander';

await program
	.option('-r, --release <release>', 'the release to build with', 'development')
	.action(async (options: { release: Release | 'development' }) => {
		await build(
			packageDirpaths.tunnelInstancePageServiceWorker,
			false,
			buildPreset({
				release: options.release === 'development' ? null : options.release,
				appEnv: options.release === 'development' ? APP_ENV : 'production',
				version: '0.0.0',
			}),
		);
	})
	.parseAsync();
