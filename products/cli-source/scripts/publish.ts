#!/usr/bin/env tsx

import { logger } from '@-/logger';
import { packageDirpaths } from '@-/packages-config';
import { getBumpedPackageVersion } from '@-/tunnel-public-packages-metadata/scripts';
import { program } from 'commander';
import esMain from 'es-main';
import { execa } from 'execa';
import path from 'pathe';
import { buildCliSource } from './build.ts';

/**
	Assumes that the package has already been built
*/
export async function publishCliSource(options: {
	build?: boolean;
	version: string;
}) {
	if (options.build) {
		await buildCliSource({ release: 'production', version: options.version });
	}

	const cliSourceDistDirpath = path.join(packageDirpaths.cliSource, '.build');

	const npmArgs = ['publish', '--access=public'];

	await execa('npm', npmArgs, {
		cwd: cliSourceDistDirpath,
		stdio: 'pipe',
	});
}

if (esMain(import.meta)) {
	await program
		.option('-b, --build', 'build the package before publishing')
		.option('--patch-bump', 'publish a bump version')
		.action(async (options: { build?: boolean }) => {
			await publishCliSource({
				build: options.build,
				version: getBumpedPackageVersion({
					packageName: '@tunnel/cli-source',
					write: true,
				}),
			});
			logger.info('Successfully published @tunnel/cli-source');
			process.exit(0);
		})
		.parseAsync();
}
