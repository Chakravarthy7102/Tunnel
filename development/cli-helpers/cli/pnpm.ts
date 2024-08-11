import { defineCliExecutable } from 'cli-specs';
import { outdent } from 'outdent';
import which from 'which';

export const pnpm = defineCliExecutable({
	executableName: 'pnpm',
	async executablePath() {
		return which('pnpm');
	},
	description: outdent`
		\`pnpm\` is a JavaScript package manager that is
		needed for third-party packages used by Tunnel.
	`,
	defaultExecaOptions: {
		stdout: 'inherit',
		stderr: 'inherit',
	},
});
