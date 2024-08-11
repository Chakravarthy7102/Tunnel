#!/usr/bin/env tsx

import { APP_ENV } from '@-/env/app';
import { packageDirpaths } from '@-/packages-config';
import { tunnelPublicPackagesMetadata } from '@-/tunnel-public-packages-metadata';
import { build, buildPreset } from '@-/unbuild';
import type { Release } from '@tunnel/release';
import { program } from 'commander';
import esMain from 'es-main';

export const buildCliSource = async (
	{ release, version }: { release: Release; version: string },
) =>
	build(
		packageDirpaths.cliSource,
		false,
		buildPreset({
			release,
			appEnv: release === null ? APP_ENV : 'production',
			version,
		}),
	);

if (esMain(import.meta)) {
	await program
		.requiredOption('--release <release>')
		.action(async ({ release }: { release: Release | 'development' }) => {
			await buildCliSource({
				release: release === 'development' ? null : release,
				version: tunnelPublicPackagesMetadata['@tunnel/cli-source'].version,
			});
		})
		.parseAsync();
}
