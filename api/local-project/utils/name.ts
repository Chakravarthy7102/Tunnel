import { destr } from 'destru';
import { findUp } from 'find-up';
import fs from 'node:fs';
import path from 'pathe';

export async function inferLocalProjectName({
	localProjectRootDirpath,
}: {
	localProjectRootDirpath: string;
}) {
	// If the user has a `package.json` file, try using that name
	const packageJsonPath = await findUp('package.json', {
		cwd: localProjectRootDirpath,
	});

	if (packageJsonPath !== undefined) {
		const packageJson = destr(
			await fs.promises.readFile(packageJsonPath, 'utf8'),
		);

		if (
			typeof packageJson === 'object' &&
			packageJson !== null &&
			'name' in packageJson &&
			typeof packageJson.name === 'string'
		) {
			return packageJson.name;
		}
	}

	// Otherwise, use the current directory name
	return path.basename(localProjectRootDirpath);
}
