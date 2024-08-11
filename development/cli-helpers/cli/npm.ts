import { getExecutablePath } from '#utils/path.ts';
import { defineCliExecutable } from 'cli-specs';
import { outdent } from 'outdent';
import { pkgx } from './pkgx.ts';

export const npm = defineCliExecutable({
	executableName: 'npm',
	executablePath: async () =>
		getExecutablePath({
			dependencyName: 'npmjs.com',
			binRelativeFilepath: 'bin/npm',
		}),
	description: outdent`
		npm
	`,
	async install() {
		await pkgx('+npmjs.com@9.8.1', { stdio: 'inherit' });
	},
	defaultExecaOptions: {
		stdout: 'inherit',
		stderr: 'inherit',
	},
});
