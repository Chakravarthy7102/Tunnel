import { isDevelopment } from '#utils/development.ts';
import { cli } from '@-/cli-helpers';
import { packageDirpaths } from '@-/packages-config';
import fs from 'node:fs';
import path from 'pathe';

export async function lefthookInstall() {
	if (
		isDevelopment() &&
		fs.existsSync(path.join(packageDirpaths.monorepo, '.git'))
	) {
		await cli.pnpm('exec lefthook install', {
			cwd: packageDirpaths.monorepo,
		});
	}
}
