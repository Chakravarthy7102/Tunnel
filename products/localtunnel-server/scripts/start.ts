#!/usr/bin/env tsx

import { cli } from '@-/cli-helpers';
import { APP_ENV } from '@-/env/app';
import { packageDirpaths } from '@-/packages-config';
import { servicesConfig } from '@-/services-config';
import fkill from '@tunnel/fkill';
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'pathe';

const { port } = servicesConfig.localtunnelServer;
if (process.env.NODE_ENV !== 'production') {
	await fkill(`:${port}`, { silent: true, force: true });
}

let CONVEX_URL: string;
if (APP_ENV === 'development') {
	const { CONVEX_URL: convexUrl } = dotenv.parse(
		fs.readFileSync(path.join(packageDirpaths.database, '.env.local')),
	);
	if (convexUrl === undefined) {
		throw new Error('CONVEX_URL is undefined');
	}

	CONVEX_URL = convexUrl;
} else {
	if (process.env.CONVEX_URL === undefined) {
		throw new Error('Missing `CONVEX_URL` environment variable');
	}

	CONVEX_URL = process.env.CONVEX_URL;
}

await cli.pnpm(
	[
		'exec',
		'tsx',
		path.join(
			packageDirpaths.localtunnelServer,
			'entry/start-server.ts',
		),
	],
	{
		stdio: 'inherit',
		env: {
			CONVEX_URL,
			TUNNEL_RELEASE: APP_ENV === 'development' ? 'development' : 'production',
		},
	},
);
