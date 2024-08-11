import { getExecutablePath } from '#utils/path.ts';
import { createPkgxInstall } from '#utils/pkgx.ts';
import { defineCliExecutable } from 'cli-specs';
import { outdent } from 'outdent';

export const coredns = defineCliExecutable({
	executableName: 'coredns',
	executablePath: async () =>
		getExecutablePath({
			dependencyName: 'coredns.io',
			binRelativeFilepath: 'bin/coredns',
		}),
	description: outdent`
		TODO
	`,
	install: createPkgxInstall('coredns.io'),
	defaultExecaOptions: {
		stdout: 'inherit',
		stderr: 'inherit',
	},
});
