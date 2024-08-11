#!/usr/bin/env tsx

import { cli } from '@-/cli-helpers';
import { env } from '@-/env';
import { logger } from '@-/logger';
import { packageDirpaths } from '@-/packages-config';
import { servicesConfig } from '@-/services-config';
import fkill from '@tunnel/fkill';
import chokidar from 'chokidar';
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'pathe';
import { buildCss } from './utils/css.ts';
import { waitForServerHealthy } from './utils/health.ts';

async function startNextDevServer() {
	const { CONVEX_URL } = dotenv.parse(
		await fs.promises.readFile(
			path.join(packageDirpaths.database, '.env.local'),
		),
	);

	// eslint-disable-next-line no-restricted-properties -- Guaranteed to be valid JSON
	const { version: databaseApiVersion } = JSON.parse(
		await fs.promises.readFile(
			path.join(packageDirpaths.database, 'convex.json'),
			'utf8',
		),
	);
	process.env.NEXT_PUBLIC_TUNNEL_DATABASE_API_VERSION = databaseApiVersion;
	const port = servicesConfig.webapp.httpPort;

	return {
		process: cli.execa('pnpm', [
			'exec',
			'next',
			'dev',
			'-p',
			port.toString(),
			'--turbo',
			...process.argv.slice(2),
		], {
			stdio: 'inherit',
			cwd: packageDirpaths.webapp,
			reject: false,
			env: {
				NODE_ENV: 'development',
				APP_ENV: 'development',
				NEXT_PUBLIC_APP_ENV: 'development',
				CONVEX_URL,
				NEXT_PUBLIC_CONVEX_URL: CONVEX_URL,
				TUNNEL_DATABASE_API_VERSION: databaseApiVersion,
				NEXT_PUBLIC_TUNNEL_DATABASE_API_VERSION: databaseApiVersion,
			},
		}),
	};
}

const port = servicesConfig.webapp.httpPort;
await fkill(`:${port}`, { silent: true });

void cli.stripe(
	[
		'listen',
		'--forward-to',
		'https://tunnel.test/api/webhooks/stripe',
		'--api-key',
		env('STRIPE_SECRET'),
	],
	{
		stdio: 'inherit',
	},
);

void waitForServerHealthy().then(() => {
	logger.info(`Webapp is ready at http://localhost:${port}`);
});

buildCss({ watch: true }).catch((error) => {
	logger.error('Error building css:', error);
});

let { process: activeNextDevServerProcess } = await startNextDevServer();
const convexJsonFilepath = path.join(packageDirpaths.database, 'convex.json');
// We restart the Next.js dev server when the convex.json file changes
chokidar.watch(convexJsonFilepath).on('change', async () => {
	activeNextDevServerProcess.kill();
	({ process: activeNextDevServerProcess } = await startNextDevServer());
});
