import { getExecutablePath } from '#utils/path.ts';
import { createPkgxInstall } from '#utils/pkgx.ts';
import { defineCliExecutable } from 'cli-specs';
import { outdent } from 'outdent';

export const git = defineCliExecutable({
	executableName: 'git',
	executablePath: async () =>
		getExecutablePath({
			dependencyName: 'git-scm.org',
			binRelativeFilepath: 'bin/git',
		}),
	description: outdent`
		\`git\` is the version control system that is needed for Tunnel development.
	`,
	install: createPkgxInstall('git-scm.org'),
	defaultExecaOptions: {
		stdout: 'inherit',
		stderr: 'inherit',
	},
});
