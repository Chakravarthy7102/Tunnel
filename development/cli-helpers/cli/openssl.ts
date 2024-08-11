import { getExecutablePath } from '#utils/path.ts';
import { createPkgxInstall } from '#utils/pkgx.ts';
import { defineCliExecutable } from 'cli-specs';
import { outdent } from 'outdent';

export const openssl = defineCliExecutable({
	executableName: 'openssl',
	executablePath: async () =>
		getExecutablePath({
			dependencyName: 'openssl.org',
			binRelativeFilepath: 'bin/openssl',
		}),
	description: outdent`
		\`openssl\` is a tool for handling certificates, which
		is needed for deploying Elasticsearch on Kubernetes.
	`,
	install: createPkgxInstall('openssl.org'),
	defaultExecaOptions: {
		stdout: 'inherit',
		stderr: 'inherit',
	},
});
