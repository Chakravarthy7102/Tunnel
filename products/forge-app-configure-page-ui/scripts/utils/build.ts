import { cli } from '@-/cli-helpers';
import { packageDirpaths } from '@-/packages-config';

export async function buildForgeAppConfigurePageUi() {
	await cli.pnpm('exec vite build', {
		cwd: packageDirpaths.forgeAppConfigurePageUi,
	});
}
