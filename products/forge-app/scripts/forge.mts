#!/usr/bin/env tsx

import { cli } from '@-/cli-helpers';
import { packageDirpaths } from '@-/packages-config';
import { z } from '@-/zod';
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'pathe';

const envLocalFilepath = path.join(packageDirpaths.forgeApp, '.env.local');

const envLocalSchema = z.object({
	FORGE_EMAIL: z.string(),
	FORGE_API_TOKEN: z.string(),
});

const { FORGE_API_TOKEN, FORGE_EMAIL } = (() => {
	if (fs.existsSync(envLocalFilepath)) {
		return envLocalSchema.parse(
			dotenv.config({ path: envLocalFilepath }).parsed,
		);
	}

	return {
		FORGE_EMAIL: undefined,
		FORGE_API_TOKEN: undefined,
	};
})();

await cli.pnpm(['exec', 'forge', ...process.argv.slice(2)], {
	stdio: 'inherit',
	cwd: packageDirpaths.forgeApp,
	env: {
		FORGE_EMAIL,
		FORGE_API_TOKEN,
	},
});
