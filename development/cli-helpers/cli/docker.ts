import { defineCliExecutable } from 'cli-specs';
import { execa } from 'execa';
import onetime from 'onetime';
import { outdent } from 'outdent';
import pTimeout from 'p-timeout';
import which from 'which';

const verifyDockerIsReady = onetime(async () => {
	const dockerVersionPromise = execa('docker', ['version']);

	await pTimeout(dockerVersionPromise, {
		milliseconds: 60_000,
		message: 'The `docker` command timed out; are you sure Docker is running?',
	});
});

export const docker = defineCliExecutable({
	executableName: 'docker',
	async executablePath() {
		return which('docker');
	},
	description: outdent`
		Docker is needed for local development on Tunnel.
	`,
	defaultExecaOptions: {
		stdout: 'inherit',
		stderr: 'inherit',
	},
	async runCommand(args, options) {
		await verifyDockerIsReady();
		return { process: execa('docker', args, options) };
	},
});
