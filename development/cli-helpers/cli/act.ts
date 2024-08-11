import { getExecutablePath } from '#utils/path.ts';
import { createPkgxInstall } from '#utils/pkgx.ts';
import { defineCliExecutable } from 'cli-specs';
import { outdent } from 'outdent';

export const act = defineCliExecutable({
	executableName: 'act',
	executablePath: async () =>
		getExecutablePath({
			dependencyName: 'github.com/nektos/act',
			binRelativeFilepath: 'bin/act',
		}),
	description: outdent`
		TODO
	`,
	install: createPkgxInstall('github.com/nektos/act'),
	defaultExecaOptions: {
		stdout: 'inherit',
		stderr: 'inherit',
	},
});
