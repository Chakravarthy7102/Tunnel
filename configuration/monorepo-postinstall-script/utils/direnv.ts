import { packageDirpaths } from '@-/packages-config';
import fs from 'node:fs';
import os from 'node:os';
import { outdent } from 'outdent';
import path from 'pathe';

export async function createDirenvTomlFile() {
	await fs.promises.mkdir(path.join(os.homedir(), '.config/direnv'), {
		recursive: true,
	});
	await fs.promises.writeFile(
		path.join(os.homedir(), '.config/direnv/direnv.toml'),
		outdent`
		[whitelist]
		exact = ["${path.join(packageDirpaths.monorepo, '.envrc')}"]

		[global]
		hide_env_diff = true
	`,
	);
}
