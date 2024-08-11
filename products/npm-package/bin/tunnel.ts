#!/usr/bin/env node

import { downloadTunnelCliSingleExecutableApplication } from '#utils/download.ts';
import { getTunnelCliSingleExecutableApplicationInstallationPath } from '#utils/installation-path.ts';
import { getRelease } from '#utils/release.ts';
import { getSupportedTargetFromOs } from '@-/targets';
import { tunnelPublicPackagesMetadata } from '@-/tunnel-public-packages-metadata';
import { objectKeys } from '@tunnel/ts';
import destr from 'destru';
import { execa } from 'execa';
import { getMonorepoDirpath } from 'get-monorepo-root';
import fs from 'node:fs';
import https from 'node:https';
import path from 'pathe';

const cliSingleExecutableApplicationSupportedTargets = objectKeys(
	tunnelPublicPackagesMetadata['@tunnel/cli-single-executable-application']
		.supportedTargets,
);

void (async () => {
	const release = getRelease();

	if (release === null) {
		const monorepoDirpath = getMonorepoDirpath(import.meta.url);
		if (monorepoDirpath === undefined) {
			throw new Error('Could not find the monorepo root directory');
		}

		const tunnelCliSingleExecutableApplicationBinFilepath = path.join(
			monorepoDirpath,
			'products/cli-single-executable-application/.build/tunnel.js',
		);

		// Execute the `tunnel` binary inside from "@-/cli-single-executable-application"
		try {
			const { exitCode } = await execa(
				tunnelCliSingleExecutableApplicationBinFilepath,
				process.argv.slice(2),
				{
					stdio: 'inherit',
					reject: true,
					env: { TUNNEL_RELEASE: 'development' },
				},
			);

			process.exit(exitCode);
		} catch (error: any) {
			if (error.exitCode !== undefined) {
				process.exit(error.exitCode);
			}

			throw error;
		}
	}

	const hostname = release === 'staging' ? 'staging.tunnel.dev' : 'tunnel.dev';

	const cliMetadataUrl = `https://${hostname}/api/cli-metadata`;
	const cliMetadataResponse = await new Promise<string>((resolve, reject) => {
		const request = https.request(
			cliMetadataUrl,
			{ method: 'GET' },
			(response) => {
				let data = '';

				response.on('data', (chunk) => {
					data += chunk;
				});

				response.on('end', () => {
					resolve(data);
				});

				response.on('error', (error) => {
					reject(error);
				});
			},
		);

		request.end();
	});

	const cliMetadata = destr(cliMetadataResponse);
	if (
		typeof cliMetadata !== 'object' ||
		cliMetadata === null ||
		!('@tunnel/cli-single-executable-application' in cliMetadata) ||
		typeof cliMetadata['@tunnel/cli-single-executable-application'] !==
			'object' ||
		cliMetadata['@tunnel/cli-single-executable-application'] === null ||
		!('version' in cliMetadata['@tunnel/cli-single-executable-application']) ||
		typeof cliMetadata['@tunnel/cli-single-executable-application'].version !==
			'string'
	) {
		throw new Error(
			`Could not parse Tunnel CLI metadata from ${cliMetadataUrl}; please try again in a bit`,
		);
	}

	const activeCliSingleExecutableApplicationVersion =
		cliMetadata['@tunnel/cli-single-executable-application'].version;

	const supportedTarget = getSupportedTargetFromOs({
		supportedTargets: cliSingleExecutableApplicationSupportedTargets,
	});

	const tunnelCliSingleExecutableApplicationInstallationPath =
		getTunnelCliSingleExecutableApplicationInstallationPath({
			supportedTarget,
			version: activeCliSingleExecutableApplicationVersion,
		});

	const tunnelCliSingleExecutableApplicationBinFilepath = path.join(
		tunnelCliSingleExecutableApplicationInstallationPath,
		supportedTarget?.startsWith('win32-') ? 'tunnel.exe' : 'tunnel',
	);

	if (!fs.existsSync(tunnelCliSingleExecutableApplicationBinFilepath)) {
		await downloadTunnelCliSingleExecutableApplication({
			supportedTarget,
			version: activeCliSingleExecutableApplicationVersion,
		});
	}

	// Execute the `tunnel` binary inside from "@-/cli-single-executable-application"
	try {
		const { exitCode } = await execa(
			tunnelCliSingleExecutableApplicationBinFilepath,
			process.argv.slice(2),
			{ stdio: 'inherit', reject: true },
		);

		process.exit(exitCode);
	} catch (error: any) {
		if (error.exitCode !== undefined) {
			process.exit(error.exitCode);
		}

		throw error;
	}
})();
