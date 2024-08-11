#!/usr/bin/env tsx

import { APP_ENV } from '@-/env/app';
import { packageDirpaths } from '@-/packages-config';
import { tunnelPublicPackagesMetadata } from '@-/tunnel-public-packages-metadata';
import { build, buildPreset } from '@-/unbuild';
import type { Release } from '@tunnel/release';
import { program } from 'commander';
import esMain from 'es-main';

export const buildCliSingleExecutableApplication = async (
	{ release, version }: { release: Release; version: string },
) => {
	await build(
		packageDirpaths.cliSingleExecutableApplication,
		false,
		buildPreset({
			appEnv: release === null ? APP_ENV : 'production',
			release,
			version,
		}),
	);
};

if (esMain(import.meta)) {
	await program
		.requiredOption('--release <release>', 'the release to build for')
		.action(async (options: { release: Release | 'development' }) => {
			await buildCliSingleExecutableApplication({
				release: options.release === 'development' ? null : options.release,
				version: tunnelPublicPackagesMetadata[
					'@tunnel/cli-single-executable-application'
				].version,
			});
		})
		.parseAsync();
}
