import { packageDirpaths } from '@-/packages-config';
import fs from 'node:fs';
import path from 'pathe';
import type { Promisable } from 'type-fest';

export function fromDockerfile(
	dockerfileRelativeDirpath: string,
	modifyDockerfile?: (dockerfile: string) => Promisable<string>,
) {
	return async function({ app }: { app: { repo: string } }) {
		let dockerfile = await fs.promises.readFile(
			path.join(
				packageDirpaths.monorepo,
				'repos',
				app.repo,
				dockerfileRelativeDirpath,
			),
			'utf8',
		);

		if (modifyDockerfile !== undefined) {
			dockerfile = await modifyDockerfile(dockerfile);
		}

		return dockerfile;
	};
}
