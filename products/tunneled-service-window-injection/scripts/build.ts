#!/usr/bin/env tsx

import { APP_ENV } from '@-/env/app';
import { packageDirpaths } from '@-/packages-config';
import { build, buildPreset } from '@-/unbuild';
import type { Release } from '@tunnel/release';
import { program } from 'commander';

await program
	.option('-r, --release <release>', 'the release to build with', 'development')
	.option('--compress', 'whether to compress the built assets', false)
	.action(
		async (
			options: { release: Release | 'development'; compress: boolean },
		) => {
			await build(
				packageDirpaths.tunneledServiceWindowInjection,
				false,
				buildPreset({
					release: options.release === 'development' ? null : options.release,
					appEnv: options.release === 'development' ? APP_ENV : 'production',
					version: options.compress ? '0.0.0' : '1.0.0',
				}),
			);
		},
	)
	.parseAsync();
