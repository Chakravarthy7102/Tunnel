import { packageDirpaths } from '@-/packages-config';
import fs from 'node:fs';
import path from 'pathe';

export function isDevelopment() {
	return fs.existsSync(path.join(packageDirpaths.monorepo, '.env'));
}
