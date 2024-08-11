#!/usr/bin/env tsx

import { displayDownloadErrorMessageAndExit } from '#utils/error.ts';
import { getRelease } from '#utils/release.ts';
import {
	getDotTunnelDirpath,
	getDotTunnelDirpathSync,
} from '@-/dot-tunnel-directory';
import type { tunnelPublicPackagesMetadata } from '@-/tunnel-public-packages-metadata';
import { ApiUrl } from '@-/url/api';
import type { Release } from '@tunnel/release';
import download from 'downl';
import { getMonorepoDirpath } from 'get-monorepo-root';
import isOnline from 'is-online';
import ky from 'ky';
import makeEmptyDir from 'make-empty-dir';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import ora from 'ora';
import path from 'pathe';
import which from 'which';

function getTunnelCliSourceNpmPackageData({ version }: { version: string }) {
	const tunnelCliSourcePackageName = '@tunnel/cli-source';

	const tunnelCliSourceTarballLink =
		`https://registry.npmjs.org/${tunnelCliSourcePackageName}/-/${
			tunnelCliSourcePackageName.replace(
				'@tunnel/',
				'',
			)
		}-${version}.tgz`;

	return {
		packageName: tunnelCliSourcePackageName,
		tarballLink: tunnelCliSourceTarballLink,
	};
}

function getTunnelCliSourceInstalledPackageDirpath({
	version,
}: {
	version: string | null;
}) {
	const pathParts = [getDotTunnelDirpathSync(), 'cli-source'];

	if (version !== null) {
		pathParts.push(version);
	}

	return path.join(...pathParts);
}

async function deleteInactiveTunnelCliPackages({
	cliMetadata,
	activeRelease,
}: {
	cliMetadata: typeof tunnelPublicPackagesMetadata;
	activeRelease: Release;
}) {
	const cliMetadatas = await (async () => {
		// If the user doesn't have `tunnel-staging` in their PATH, we only keep the version that is currently on production
		if (!(await which('tunnel-staging', { nothrow: true }))) {
			return [cliMetadata];
		}

		return activeRelease === 'production' ?
			[cliMetadata, await getCliMetadata({ release: 'staging' })] :
			[await getCliMetadata({ release: 'production' }), cliMetadata];
	})();

	const dotTunnelDirpath = await getDotTunnelDirpath();

	async function removeOutdatedInstallations(
		packageSlug: 'cli-source' | 'cli-single-executable-application',
	) {
		if (packageSlug === 'cli-single-executable-application') {
			const targets = await (async () => {
				try {
					return await fs.promises.readdir(
						path.join(dotTunnelDirpath, packageSlug),
					);
				} catch {
					return [];
				}
			})();

			await Promise.all(targets.map(async (target) => {
				const versions = await (async () => {
					try {
						return await fs.promises.readdir(
							path.join(dotTunnelDirpath, packageSlug, target),
						);
					} catch {
						return [];
					}
				})();

				const outdatedVersions = versions.filter((version) =>
					!cliMetadatas.some((metadata) =>
						metadata[`@tunnel/${packageSlug}`].version === version
					)
				);
				await Promise.all(
					outdatedVersions.map(async (version) =>
						fs.promises.rm(
							path.join(dotTunnelDirpath, packageSlug, target, version),
							{ force: true, recursive: true },
						)
					),
				);
			}));
		} else {
			const versions = await (async () => {
				try {
					return await fs.promises.readdir(
						path.join(dotTunnelDirpath, packageSlug),
					);
				} catch {
					return [];
				}
			})();

			const outdatedVersions = versions.filter((version) =>
				!cliMetadatas.some((metadata) =>
					metadata[`@tunnel/${packageSlug}`].version === version
				)
			);
			await Promise.all(
				outdatedVersions.map(async (version) =>
					fs.promises.rm(
						path.join(dotTunnelDirpath, packageSlug, version),
						{ force: true, recursive: true },
					)
				),
			);
		}
	}

	await Promise.all([
		removeOutdatedInstallations('cli-source'),
		removeOutdatedInstallations('cli-single-executable-application'),
	]);
}

async function getCliMetadata({ release }: { release: Release }) {
	const cliMetadataUrl = ApiUrl.getWebappUrl({
		fromRelease: release,
		withScheme: true,
		path: '/api/cli-metadata',
	});
	const cliMetadataResponse = await ky.get(cliMetadataUrl);
	const cliMetadata = await cliMetadataResponse
		.json();
	return cliMetadata as typeof tunnelPublicPackagesMetadata & {
		'@-/database': { version: string };
	};
}

/**
	Attempts to download the targeted version of the CLI and falls back to the untargeted version if it fails.
*/
async function getOrDownloadTunnelCliSource({
	release,
}: {
	release: Release;
}): Promise<{
	tunnelCliSourceEntryFilepath: string;
	tunnelCliSourceInstalledPackageDirpath: string;
	activeCliSourceVersion: string;
	databaseVersion: string;
}> {
	/*
		1. Fetches the active version of the `@tunnel/cli-source` package (by querying <https://tunnel.dev/api/cli-metadata>) and checks if a folder exists at `~/.tunnel/cli-source/<active-version>`.
			- If the folder doesn't exist, dynamically downloads the latest version of `@tunnel/cli-source` from NPM
	*/

	const cliMetadata = await getCliMetadata({ release });
	const activeCliSourceVersion = cliMetadata['@tunnel/cli-source'].version;
	const databaseVersion = cliMetadata['@-/database'].version;

	// We asynchronously delete all versions of the Tunnel CLI that are not active
	void deleteInactiveTunnelCliPackages({
		activeRelease: release,
		cliMetadata,
	});

	const tunnelCliSourceInstalledPackageDirpath =
		getTunnelCliSourceInstalledPackageDirpath({
			version: activeCliSourceVersion,
		});

	const tunnelCliSourceEntryFilepath = path.join(
		tunnelCliSourceInstalledPackageDirpath,
		'entry/tunnel.js',
	);

	// If the @tunnel/cli-source entry file already exists, then we can skip downloading it
	if (fs.existsSync(tunnelCliSourceEntryFilepath)) {
		return {
			tunnelCliSourceEntryFilepath,
			tunnelCliSourceInstalledPackageDirpath,
			activeCliSourceVersion,
			databaseVersion,
		};
	}

	// If the @tunnel/cli-source entry file doesn't exist, it means that version has not been downloaded yet, so we download it
	await makeEmptyDir(tunnelCliSourceInstalledPackageDirpath, {
		recursive: true,
	});

	const updateSpinner = ora('🚀 Updating the Tunnel CLI...').start();

	const { tarballLink } = getTunnelCliSourceNpmPackageData({
		version: activeCliSourceVersion,
	});

	try {
		await download(tarballLink, tunnelCliSourceInstalledPackageDirpath, {
			extract: { strip: 1 },
		});

		updateSpinner.succeed('🚀 Updated the Tunnel CLI!');

		return {
			tunnelCliSourceEntryFilepath,
			tunnelCliSourceInstalledPackageDirpath,
			activeCliSourceVersion,
			databaseVersion,
		};
	} catch (error) {
		displayDownloadErrorMessageAndExit({ error });
	}
}

async function runTunnel() {
	const release = getRelease();

	if (release === null) {
		const monorepoDirpath = getMonorepoDirpath(import.meta.url);
		if (monorepoDirpath === undefined) {
			throw new Error('Could not find the monorepo root directory');
		}

		const tunnelCliSourcePackageDirpath = path.join(
			monorepoDirpath,
			'products/cli-source/.build',
		);

		const tunnelCliSourceEntryFilepath = path.join(
			tunnelCliSourcePackageDirpath,
			'entry/tunnel.js',
		);

		createRequire(tunnelCliSourcePackageDirpath)(tunnelCliSourceEntryFilepath);
		return;
	}

	let tunnelCliSourceEntryFilepath: string;
	let databaseVersion: string | undefined;

	if (await isOnline()) {
		({ tunnelCliSourceEntryFilepath, databaseVersion } =
			await getOrDownloadTunnelCliSource({ release }));
	} else {
		// If the user is offline, we should use the latest version of the Tunnel CLI they have installed
		const tunnelCliSourceInstallatedPackagesDirpath =
			getTunnelCliSourceInstalledPackageDirpath({
				version: null,
			});

		if (!fs.existsSync(tunnelCliSourceInstallatedPackagesDirpath)) {
			console.info(
				'Could not find a locally installed version of the Tunnel CLI; please connect to the internet and try again',
			);
			process.exit(1);
		}

		const latestCliSourceVersion = fs
			.readdirSync(tunnelCliSourceInstallatedPackagesDirpath)
			.sort()
			.filter((version) =>
				fs.existsSync(
					path.join(
						tunnelCliSourceInstallatedPackagesDirpath,
						version,
						'entry/tunnel.js',
					),
				)
			)
			.at(-1);

		if (latestCliSourceVersion === undefined) {
			console.info(
				'Could not find a locally installed version of the Tunnel CLI; please connect to the internet and try again',
			);
			process.exit(1);
		}

		tunnelCliSourceEntryFilepath = path.join(
			tunnelCliSourceInstallatedPackagesDirpath,
			latestCliSourceVersion,
			'entry/tunnel.js',
		);
	}

	const tunnelCliSourcePackageDirpath = path.dirname(
		path.dirname(tunnelCliSourceEntryFilepath),
	);

	if (databaseVersion !== undefined) {
		process.env.TUNNEL_DATABASE_VERSION = databaseVersion;
	}

	/*
		2. Evaluates `~/.tunnel/cli-source/<version>/entry/tunnel.js` via a Node.js `require` call.

		We need to use `createRequire` here because the built-in `require` doesn't work with arbitrary file paths inside of a Node.js SEA
	*/
	createRequire(tunnelCliSourcePackageDirpath)(tunnelCliSourceEntryFilepath);
}

void runTunnel();
