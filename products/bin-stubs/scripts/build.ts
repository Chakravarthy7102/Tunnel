#!/usr/bin/env tsx

import { packageDirpaths } from '@-/packages-config';
import { build, buildPreset } from '@-/unbuild';

await build(
	packageDirpaths.binStubs,
	false,
	buildPreset({
		appEnv: 'development',
		release: null,
		version: '0.0.0',
	}),
);
