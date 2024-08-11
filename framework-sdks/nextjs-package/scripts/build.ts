#!/usr/bin/env tsx

import { APP_ENV } from '@-/env/app';
import { logger } from '@-/logger';
import { packageDirpaths } from '@-/packages-config';
import { tunnelPublicPackagesMetadata } from '@-/tunnel-public-packages-metadata';
import { build, buildPreset } from '@-/unbuild';
import type { Release } from '@tunnel/release';
import { program } from 'commander';
import esMain from 'es-main';

export const buildNextjsPackage = async ({ release, version }: {
	release: Release;
	version: string;
}) =>
	build(
		packageDirpaths.nextjsPackage,
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
		.action(async (options: { release: Release | 'development' }) => {
			logger.info(`Building @tunnel/nextjs (release: ${options.release})...`);
			await buildNextjsPackage({
				release: options.release === 'development' ? null : options.release,
				version: tunnelPublicPackagesMetadata['@tunnel/nextjs'].version,
			});
			logger.event(
				`Successfully built @tunnel/nextjs (release: ${options.release})!`,
			);
		})
		.parseAsync();
}
