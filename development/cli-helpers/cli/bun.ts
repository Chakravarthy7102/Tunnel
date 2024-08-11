import { getExecutablePath } from '#utils/path.ts';
import { defineCliExecutable } from 'cli-specs';
import { outdent } from 'outdent';
import { pkgx } from './pkgx.ts';

export const bun = defineCliExecutable({
	executableName: 'bun',
	executablePath: async () =>
		getExecutablePath({
			dependencyName: 'bun.sh',
			binRelativeFilepath: 'bin/bun',
		}),
	description: outdent`
		bun
	`,
	async install() {
		await pkgx('+bun.sh@1.0.18', { stdio: 'inherit' });
	},
	defaultExecaOptions: {
		stdout: 'inherit',
		stderr: 'inherit',
	},
});
