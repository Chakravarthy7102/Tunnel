import { TunnelConvexHttpClient } from '#utils/client.ts';
import { getCliAuthClient } from '@-/auth/cli';
import type { Id } from '@-/database';
import { APP_ENV } from '@-/env/app';
import { packageDirpaths } from '@-/packages-config';
import dotenv from 'dotenv';
import fs from 'node:fs';
import onetime from 'onetime';
import path from 'pathe';
import { getConvexUrlFromEnvironment } from './main.ts';

export const getConvexUrl = onetime(async () => {
	if (APP_ENV === 'production') {
		return getConvexUrlFromEnvironment();
	}

	const convexEnvLocalFilepath = path.join(
		packageDirpaths.database,
		'.env.local',
	);
	if (!fs.existsSync(convexEnvLocalFilepath)) {
		throw new Error(
			'Missing .env.local file in "api/database" directory (make sure you run `pnpm run setup`)',
		);
	}

	const { CONVEX_URL } = dotenv.parse(
		await fs.promises.readFile(convexEnvLocalFilepath),
	);

	if (CONVEX_URL === undefined) {
		throw new Error('Missing CONVEX_URL in .env.local');
	}

	return CONVEX_URL;
});

export const getConvex = async (
	{ actorUserId }: { actorUserId: Id<'User'> },
) => {
	const convexUrl = await getConvexUrl();
	const authClient = getCliAuthClient();
	const accessToken = await authClient.getAccessToken({ actorUserId });
	return new TunnelConvexHttpClient(convexUrl, accessToken);
};
