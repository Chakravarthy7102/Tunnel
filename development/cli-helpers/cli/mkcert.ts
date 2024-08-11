import { getExecutablePath } from '#utils/path.ts';
import { createPkgxInstall } from '#utils/pkgx.ts';
import { defineCliExecutable } from 'cli-specs';
import { outdent } from 'outdent';

export const mkcert = defineCliExecutable({
	executableName: 'mkcert',
	executablePath: async () =>
		getExecutablePath({
			dependencyName: 'mkcert.dev',
			binRelativeFilepath: 'bin/mkcert',
		}),
	description: outdent`
		\`mkcert\` is a tool for creating trusted local
		certificates, needed for local Kubernetes development.
	`,
	install: createPkgxInstall('mkcert.dev'),
	defaultExecaOptions: {
		stdout: 'pipe',
		stderr: 'pipe',
	},
});
