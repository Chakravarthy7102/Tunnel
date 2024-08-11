import { packageDirpaths } from '@-/packages-config';
import { getPkgxDependencyBinFilepath } from '@-/pkgx';
import { defineCliExecutable } from 'cli-specs';
import isCi from 'is-ci';
import isDocker from 'is-docker';
import fs from 'node:fs';
import { outdent } from 'outdent';
import path from 'pathe';
import which from 'which';

export const node = defineCliExecutable({
	executableName: 'node',
	async executablePath() {
		const nodeModulesBinNode = path.join(
			packageDirpaths.monorepo,
			'node_modules/.bin/node',
		);
		if (fs.existsSync(nodeModulesBinNode)) {
			return nodeModulesBinNode;
		}

		const binFilepath = isCi || isDocker() ?
			await which('node', { nothrow: true }) :
			null;

		return (
			binFilepath ??
				getPkgxDependencyBinFilepath({
					dependencyName: 'nodejs.org',
					binRelativeFilepath: 'bin/node',
				})
		);
	},
	description: outdent`
		\`node\` is the JavaScript runtime that Tunnel uses.
	`,
	defaultExecaOptions: {
		stdout: 'inherit',
		stderr: 'inherit',
	},
});
