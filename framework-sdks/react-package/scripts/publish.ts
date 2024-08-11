#!/usr/bin/env tsx

import { logger } from '@-/logger';
import { getOctokit } from '@-/octokit';
import { packageDirpaths } from '@-/packages-config';
import { getBumpedPackageVersion } from '@-/tunnel-public-packages-metadata/scripts';
import { z } from '@-/zod';
import { dayjs } from '@tunnel/dayjs';
import type { Release } from '@tunnel/release';
import { program } from 'commander';
import destr from 'destru';
import esMain from 'es-main';
import { execa } from 'execa';
import fs from 'node:fs';
import path from 'pathe';
import { buildReactPackage } from './build.ts';

export async function publishReactPackage(options: {
	build?: boolean;
	release: Release;
}) {
	const bumpedPackageVersion = getBumpedPackageVersion({
		packageName: '@tunnel/react',
	});

	if (options.build) {
		await buildReactPackage({
			release: options.release,
			version: bumpedPackageVersion,
		});
	}

	const npmArgs = ['publish', '--access=public'];
	const distDirpath = path.join(packageDirpaths.reactPackage, '.build');
	await execa('npm', npmArgs, {
		cwd: distDirpath,
		stdio: 'inherit',
	});

	const octokit = getOctokit();
	dayjs.tz.setDefault('America/New_York');

	await octokit.createOrUpdateFiles({
		owner: 'Tunnel-Labs',
		repo: 'Tunnel',
		branch: 'main',
		changes: [
			{
				message: `@tunnel/react@${bumpedPackageVersion} [skip ci]`,
				files: {
					...(await (async () => {
						const publicPackagesMetadataFilepath = path.join(
							packageDirpaths.tunnelPublicPackagesMetadata,
							'data/metadata.json',
						);

						const publicPackagesMetadata = z
							.record(z.string(), z.unknown())
							.parse(
								destr(
									await fs.promises.readFile(
										publicPackagesMetadataFilepath,
										'utf8',
									),
								),
							);
						return {
							[
								path.relative(
									packageDirpaths.monorepo,
									publicPackagesMetadataFilepath,
								)
							]: JSON.stringify(
								{
									...publicPackagesMetadata,
									'@tunnel/react': {
										version: bumpedPackageVersion,
									},
								},
								null,
								'\t',
							) + '\n',
						};
					})()),
				},
			},
		],
	});
}

if (esMain(import.meta)) {
	await program
		.option('-b, --build', 'build the package before publishing')
		.requiredOption('-r, --release <release>', 'release')
		.action(
			async (options: {
				build?: boolean;
				release: Release;
			}) => {
				await publishReactPackage({
					build: options.build,
					release: options.release,
				});
				logger.info('Successfully published @tunnel/react');
				process.exit(0);
			},
		)
		.parseAsync();
}
