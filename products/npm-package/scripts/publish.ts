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
import { buildNpmPackage } from './build.ts';

export async function publishNpmPackage(options: {
	build?: boolean;
	release: Release;
}) {
	const packageName = options.release === 'staging' ?
		'@tunnel/cli-staging' :
		'@tunnel/cli';
	const bumpedPackageVersion = getBumpedPackageVersion({ packageName });

	if (options.build) {
		await buildNpmPackage({
			release: options.release,
			version: bumpedPackageVersion,
		});
	}

	const npmArgs = ['publish', '--access=public'];
	const distDirpath = path.join(packageDirpaths.npmPackage, '.build');
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
				message: `${packageName}@${bumpedPackageVersion} [skip ci]`,
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
									[packageName]: {
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
		.option('-b, --build', 'Build the package before publishing')
		.requiredOption('--release <release>')
		.action(
			async (options: {
				build?: boolean;
				release: Release;
			}) => {
				await publishNpmPackage({
					build: options.build,
					release: options.release,
				});

				const packageName = options.release === 'staging' ?
					'@tunnel/cli-staging' :
					'@tunnel/cli';
				logger.info(`Successfully published ${packageName}`);
				process.exit(0);
			},
		)
		.parseAsync();
}
