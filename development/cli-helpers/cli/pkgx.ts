import { defineCliExecutable } from 'cli-specs';
import { execa } from 'execa';
import { outdent } from 'outdent';
import which from 'which';

export const pkgx = defineCliExecutable({
	executableName: 'pkgx',
	async executablePath() {
		return which('pkgx');
	},
	description: outdent`
		Package manager for Tunnel CLI tools.
	`,
	async runCommand(args, options) {
		return {
			process: execa('pkgx', [...args], {
				...options,
				env: {
					TEA_YES: '1',
					NODE_ENV: process.env.NODE_ENV,
					...options?.env,
				},
			}),
		};
	},
	async install() {
		const { stdout: pkgxInstallScript } = await execa(
			'curl',
			['-fsS', 'https://pkgx.sh'],
			{ stdout: 'pipe' },
		);

		await execa('sh', {
			input: pkgxInstallScript,
			stdout: 'inherit',
			stderr: 'inherit',
		});
	},
	defaultExecaOptions: {
		stdout: 'pipe',
		stderr: 'pipe',
		env: {
			TEA_YES: '1',
			NODE_ENV: process.env.NODE_ENV,
		},
	},
});
