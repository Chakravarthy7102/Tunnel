#!/usr/bin/env tsx

import { APP_ENV } from '@-/env/app';
import { packageDirpaths } from '@-/packages-config';
import { build, buildPreset } from '@-/unbuild';
import type { Release } from '@tunnel/release';
import { program } from 'commander';
import esMain from 'es-main';

export const buildPackageAugmentations = async (
	{ release }: { release: Release },
) =>
	build(
		packageDirpaths.packageAugmentations,
		false,
		buildPreset({
			release,
			version: '0.0.0',
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
			await buildPackageAugmentations({
				release: options.release === 'development' ? null : options.release,
			});
		})
		.parseAsync();
}
