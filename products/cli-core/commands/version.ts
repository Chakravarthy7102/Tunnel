export function runVersionCommand({ cliVersion }: { cliVersion: string }) {
	process.stdout.write(cliVersion + '\n');
}
