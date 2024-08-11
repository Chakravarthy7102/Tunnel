#!/usr/bin/env tsx

import { packageDirpaths } from '@-/packages-config';
import { generateBinStubs } from './utils/generate.ts';

await generateBinStubs({
	monorepoDirpath: packageDirpaths.monorepo,
	release: null,
});
