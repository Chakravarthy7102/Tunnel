#!/usr/bin/env tsx

import { APP_ENV } from '@-/env/app';
import { packageDirpaths } from '@-/packages-config';
import { build, buildPreset } from '@-/unbuild';
import { program } from 'commander';

await program.action(async () => {
	await build(
		packageDirpaths.tunnelInstancePageToolbar,
		false,
		buildPreset({
			release: null,
			appEnv: APP_ENV,
			version: '0.0.0',
			options: { watch: true },
		}),
	);
})
	.parseAsync();
