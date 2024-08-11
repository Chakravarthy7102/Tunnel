#!/usr/bin/env tsx

import { logger } from '@-/logger';
import { packageDirpaths } from '@-/packages-config';
import { tunnelPublicPackagesMetadata } from '@-/tunnel-public-packages-metadata';
import { program } from 'commander';
import esMain from 'es-main';
import { execa } from 'execa';
import fs from 'node:fs';
import path from 'pathe';
import { buildCliSingleExecutableApplication } from './build.ts';

export async function packCliSingleExecutableApplication(options: {
	build?: boolean;
	version: string;
}) {
	if (options.build) {
		await buildCliSingleExecutableApplication({
			release: 'production',
			version: options.version,
		});
	}

	const targetStrings = await fs.promises.readdir(
		path.join(packageDirpaths.cliSingleExecutableApplication, 'targets'),
	);

	await Promise.all(
		targetStrings.map(async (targetString) => {
			const targetDistDirpath = path.join(
				packageDirpaths.cliSingleExecutableApplication,
				'targets',
				targetString,
				'.build',
			);

			// We create a tarball locally so we can compute the sha256 hash for the homebrew formula file
			await execa('npm', ['pack'], {
				cwd: targetDistDirpath,
			});
		}),
	);
}

if (esMain(import.meta)) {
	await program
		.option('-b, --build', 'Build the package before publishing')
		.action(async (options: { build?: boolean }) => {
			await packCliSingleExecutableApplication({
				build: options.build,
				version: tunnelPublicPackagesMetadata[
					'@tunnel/cli-single-executable-application'
				].version,
			});
			logger.info(
				`Successfully packed '@tunnel/cli-single-executable-application' packages`,
			);
			process.exit(0);
		})
		.parseAsync();
}
