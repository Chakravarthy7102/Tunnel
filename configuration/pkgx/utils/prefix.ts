import os from 'node:os';
import path from 'pathe';

export function getPkgxPrefix() {
	return path.join(os.homedir(), '.pkgx');
}
