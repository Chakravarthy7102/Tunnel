#!/usr/bin/env tsx

import { APP_ENV } from '@-/env/app';
import { logger } from '@-/logger';
import { packageDirpaths } from '@-/packages-config';
import { tunnelPublicPackagesMetadata } from '@-/tunnel-public-packages-metadata';
import { build, buildPreset } from '@-/unbuild';
import type { NonNullRelease, Release } from '@tunnel/release';
import { program } from 'commander';
import esMain from 'es-main';

export const buildAngularPackage = async (
	{ release, version }: { release: Release; version: string },
) =>
	build(
		packageDirpaths.angularPackage,
		false,
		buildPreset({
			appEnv: release === null ? APP_ENV : 'production',
			release,
			version,
		}),
	);

if (esMain(import.meta)) {
	await program
		.option(
			'-r, --release <release>',
			'the release to build with',
			'development',
		)
		.action(async (options: { release: NonNullRelease | 'development' }) => {
			logger.info(`Building @tunnel/angular (release: ${options.release})...`);
			await buildAngularPackage({
				release: options.release === 'development' ? null : options.release,
				version: tunnelPublicPackagesMetadata['@tunnel/angular'].version,
			});
			logger.event(
				`Successfully built @tunnel/angular (release: ${options.release})!`,
			);
		})
		.parseAsync();
}
