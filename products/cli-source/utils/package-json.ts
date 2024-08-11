import { fileURLToPath } from 'node:url';
import { readPackageUp } from 'read-pkg-up';

export async function getTunnelCliNpmPackageJson() {
	const readResult = await readPackageUp({
		cwd: fileURLToPath(import.meta.url),
	});

	return readResult?.packageJson;
}
