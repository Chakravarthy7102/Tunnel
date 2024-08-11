import { runTunnelCli } from '@-/cli-core';
import { RELEASE } from '@-/env/app';
import { logger } from '@-/logger';
import { execa } from 'execa';
import { getMonorepoDirpath } from 'get-monorepo-root';
import { resolve } from 'import-meta-resolve';
import { fileURLToPath } from 'node:url';
import path from 'pathe';

export async function startTunnelCli({
	cliVersion,
}: {
	cliVersion: string;
}) {
	// In development, we want to register tsx in order to support importing TypeScript packages.
	if (RELEASE === null && !process.env.TUNNEL_LOADER) {
		const tunnelLoaderPath = fileURLToPath(
			resolve('tsx', import.meta.url),
		);

		logger.debug(`Re-running CLI with tsx (${tunnelLoaderPath})...`);

		const binStubsScriptsString = '@-/bin-stubs/scripts';
		const monorepoDirpath = getMonorepoDirpath(import.meta.url);
		if (monorepoDirpath === undefined) {
			throw new Error('Could not find monorepo root directory.');
		}

		const { generateBinStubs } = (await import(
			binStubsScriptsString
		)) as typeof import('@-/bin-stubs/scripts');
		await generateBinStubs({ monorepoDirpath, release: null });

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- Guaranteed to exist
		const { exitCode } = await execa(
			path.join(path.dirname(tunnelLoaderPath), 'cli.mjs'),
			process.argv.slice(1),
			{
				env: {
					...process.env,
					TUNNEL_LOADER: '1',
				},
				stdio: 'inherit',
				reject: false,
			},
		);

		process.exit(exitCode);
	}

	if (process.argv.slice(2).includes('--version')) {
		process.stdout.write(cliVersion + '\n');
		process.exit(0);
	}

	const result = await runTunnelCli({
		cliVersion,
		argv: process.argv.slice(2),
	});

	if (result.isOk()) {
		if (typeof result.value === 'number') {
			process.exit(result.value);
		}
	} else {
		if (
			typeof result.error === 'object' && result.error !== null &&
			'message' in result.error
		) {
			logger.error('An error occurred:', result.error.message);
		}

		// TODO: display support link
		process.exit(1);
	}
}
