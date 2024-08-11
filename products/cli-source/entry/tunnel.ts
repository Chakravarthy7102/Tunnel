#!/usr/bin/env node

import { getMonorepoDirpath } from 'get-monorepo-root';
process.env.TUNNEL_MONOREPO_DIRPATH ??= getMonorepoDirpath(import.meta.url);

import { startTunnelCli } from '#utils/cli.ts';
import { APP_ENV, RELEASE } from '@-/env/app';
import { packageDirpaths } from '@-/packages-config';
import { tunnelPublicPackagesMetadata } from '@-/tunnel-public-packages-metadata';
import dotenv from 'dotenv';
import path from 'pathe';

if (APP_ENV === 'development') {
	dotenv.config({ path: path.join(packageDirpaths.monorepo, '.env') });
}

process.on('unhandledRejection', (error) => {
	if (RELEASE === 'production') {
		if (typeof error === 'object' && error !== null && 'message' in error) {
			console.error(error.message);
		} else {
			console.error(error);
		}
	} else {
		console.error(error);
	}
});

process.on('uncaughtException', (error) => {
	if (RELEASE === 'production') {
		if ('message' in error) {
			console.error(error.message);
		} else {
			console.error(error);
		}
	} else {
		console.error(error);
	}
});

// eslint-disable-next-line unicorn/prefer-top-level-await -- We don't use top-level await in order to support more Node versions
void startTunnelCli({
	cliVersion: tunnelPublicPackagesMetadata['@tunnel/cli-source'].version,
});
