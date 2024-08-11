import { cli } from '@-/cli-helpers';
import type { AppEnv } from '@-/env/app';
import { packageDirpaths } from '@-/packages-config';
import { servicesConfig } from '@-/services-config';
import fkill from '@tunnel/fkill';
import { waitForServerHealthy } from './health.ts';

export async function startWebapp({
	convexUrl,
	appEnv,
}: {
	convexUrl: string;
	appEnv: AppEnv;
}) {
	const port = servicesConfig.webapp.httpPort;
	if (appEnv !== 'production') {
		await fkill(`:${port}`, { silent: true });
	}

	const nextProcess = cli.execa('pnpm', [
		'exec',
		'next',
		'start',
		'-p',
		port.toString(),
	], {
		stdio: 'inherit',
		cwd: packageDirpaths.webapp,
		reject: false,
		env: {
			NODE_ENV: 'production',
			APP_ENV: appEnv,
			NEXT_PUBLIC_APP_ENV: appEnv,
			CONVEX_URL: convexUrl,
			NEXT_PUBLIC_CONVEX_URL: convexUrl,
		},
	});

	await waitForServerHealthy();
	await nextProcess;
}
