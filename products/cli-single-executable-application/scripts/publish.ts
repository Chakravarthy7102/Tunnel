#!/usr/bin/env tsx

import {
	getTunnelCliSingleExecutableApplicationBottles,
	getTunnelCliSingleExecutableApplicationFormula,
	updateFormulaFileOnGithub,
	uploadBottlesToGithubReleases,
} from '@-/homebrew-formula';
import { logger } from '@-/logger';
import { packageDirpaths } from '@-/packages-config';
import { tunnelPublicPackagesMetadata } from '@-/tunnel-public-packages-metadata';
import { program } from 'commander';
import esMain from 'es-main';
import { execa } from 'execa';
import { hashFile } from 'hasha';
import fs from 'node:fs';
import path from 'pathe';
import { buildCliSingleExecutableApplication } from './build.ts';

export async function publishCliSingleExecutableApplication(options: {
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

	const tunnelCliSingleExecutableApplicationVersion = options.version;

	const hashes = {
		'darwin-arm64': null as string | null,
		'darwin-x64': null as string | null,
		'linux-arm64': null as string | null,
		'linux-x64': null as string | null,
	};

	await Promise.all([
		...targetStrings.map(async (targetString) => {
			const targetDistDirpath = path.join(
				packageDirpaths.cliSingleExecutableApplication,
				'targets',
				targetString,
				'.build',
			);

			if (targetString in hashes) {
				// We create a tarball locally so we can compute the sha256 hash for the homebrew formula file
				await execa('npm', ['pack'], {
					cwd: targetDistDirpath,
				});

				const tarballFilename =
					`tunnel-cli-single-executable-application-${targetString}-${tunnelCliSingleExecutableApplicationVersion}.tgz`;

				const sha256Hash = await hashFile(
					path.join(targetDistDirpath, tarballFilename),
					{ algorithm: 'sha256' },
				);

				hashes[targetString as keyof typeof hashes] = sha256Hash;

				await execa('npm', ['publish', tarballFilename, '--access=public'], {
					cwd: targetDistDirpath,
					stdio: 'inherit',
				});
			} else {
				const npmArgs = ['publish', '--access=public'];

				await execa('npm', npmArgs, {
					cwd: targetDistDirpath,
					stdio: 'inherit',
				});
			}
		}),
		(async () => {
			const npmArgs = ['publish', '--access=public'];

			await execa('npm', npmArgs, {
				cwd: path.join(
					packageDirpaths.cliSingleExecutableApplication,
					'.build',
				),
				stdio: 'inherit',
			});
		})(),
	]);

	if (
		hashes['darwin-arm64'] === null ||
		hashes['darwin-x64'] === null ||
		hashes['linux-arm64'] === null ||
		hashes['linux-x64'] === null
	) {
		throw new Error('Missing hash');
	}

	const targets = {
		'darwin-arm64': {
			sha256Hash: hashes['darwin-arm64'],
			tunnelBinFilepath: path.join(
				packageDirpaths.cliSingleExecutableApplication,
				'targets/darwin-arm64/.build/tunnel',
			),
		},
		'darwin-x64': {
			sha256Hash: hashes['darwin-x64'],
			tunnelBinFilepath: path.join(
				packageDirpaths.cliSingleExecutableApplication,
				'targets/darwin-x64/.build/tunnel',
			),
		},
		'linux-arm64': {
			sha256Hash: hashes['linux-arm64'],
			tunnelBinFilepath: path.join(
				packageDirpaths.cliSingleExecutableApplication,
				'targets/linux-arm64/.build/tunnel',
			),
		},
		'linux-x64': {
			sha256Hash: hashes['linux-x64'],
			tunnelBinFilepath: path.join(
				packageDirpaths.cliSingleExecutableApplication,
				'targets/linux-x64/.build/tunnel',
			),
		},
	};

	const tunnelCliSingleExecutableApplicationBottles =
		await getTunnelCliSingleExecutableApplicationBottles({
			targets,
			version: tunnelCliSingleExecutableApplicationVersion,
		});

	await uploadBottlesToGithubReleases({
		version: tunnelCliSingleExecutableApplicationVersion,
		bottles: tunnelCliSingleExecutableApplicationBottles,
	});

	const tunnelCliSingleExecutableApplicationFormula =
		getTunnelCliSingleExecutableApplicationFormula({
			version: tunnelCliSingleExecutableApplicationVersion,
			targets,
			bottles: tunnelCliSingleExecutableApplicationBottles,
		});

	await updateFormulaFileOnGithub({
		formula: tunnelCliSingleExecutableApplicationFormula,
	});
}

if (esMain(import.meta)) {
	await program
		.option('-b, --build', 'Build the package before publishing')
		.action(async (options: { build?: boolean }) => {
			await publishCliSingleExecutableApplication({
				build: options.build,
				version: tunnelPublicPackagesMetadata[
					'@tunnel/cli-single-executable-application'
				].version,
			});
			logger.info(
				`Successfully published '@tunnel/cli-single-executable-application' packages`,
			);
			process.exit(0);
		})
		.parseAsync();
}
