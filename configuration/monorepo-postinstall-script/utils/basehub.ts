import { cli } from '@-/cli-helpers';
import { packageDirpaths } from '@-/packages-config';

export async function generateBasehub() {
	await cli.pnpm('exec basehub', { cwd: packageDirpaths.webapp });
}
