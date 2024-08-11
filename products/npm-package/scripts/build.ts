#!/usr/bin/env tsx

import { APP_ENV } from '@-/env/app';
import { logger } from '@-/logger';
import { packageDirpaths } from '@-/packages-config';
import { tunnelPublicPackagesMetadata } from '@-/tunnel-public-packages-metadata';
import { build, buildPreset } from '@-/unbuild';
import type { Release } from '@tunnel/release';
import { program } from 'commander';
import esMain from 'es-main';

export const buildNpmPackage = async (
	{ release, version }: { release: Release; version: string },
) =>
	build(
		packageDirpaths.npmPackage,
		false,
		buildPreset({
			release,
			version,
			appEnv: release === null ? APP_ENV : 'production',
		}),
	);

if (esMain(import.meta)) {
	await program
		.option(
			'-r, --release <release>',
			'the release to build with',
			'development',
		)
		.action(async (options: { release: Release | 'development' }) => {
			logger.info(`Building npm package for ${options.release}...`);
			await buildNpmPackage({
				release: options.release === 'development' ? null : options.release,
				version: tunnelPublicPackagesMetadata['@tunnel/cli'].version,
			});
			logger.event(`Successfully built npm package for ${options.release}!`);
		})
		.parseAsync();
}
