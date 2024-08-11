#!/usr/bin/env tsx

// To run tests on CI/CD, we need to build and run the webapp and the project live preview server on the runner instance.

import { cli } from '@-/cli-helpers';
import { packageDirpaths } from '@-/packages-config';
import { runPlaywrightTests } from '@-/playwright-tests/scripts';
import { buildWebapp, startWebapp } from '@-/webapp/scripts';
import { consola } from 'consola';
import dotenv from 'dotenv';
import isCi from 'is-ci';
import ky from 'ky';
import fs from 'node:fs';
import os from 'node:os';
import pWaitFor from 'p-wait-for';
import path from 'pathe';

process.env.NODE_ENV = 'test';
process.env.APP_ENV = 'test';

async function test() {
	const { CONVEX_URL } = dotenv.parse(
		fs.readFileSync(path.join(packageDirpaths.database, '.env.local')),
	);

	if (CONVEX_URL === undefined) {
		throw new Error('Missing CONVEX_URL in .env.local');
	}

	await Promise.all([
		buildWebapp({
			appEnv: 'test',
			release: null,
			convexUrl: CONVEX_URL,
		}),
		cli.execa('pnpm', ['exec', 'convex', 'deploy'], {
			cwd: packageDirpaths.database,
			env: {
				NODE_ENV: 'development',
			},
		}),
	]);

	if (isCi) {
		/**
		This is necessary for mkcert to install the local certificates for Playwright.
		@see https://github.com/microsoft/playwright/issues/4785#issuecomment-1611417285
	*/
		await cli.execa('sudo', ['mkdir', '-p', '/root/tunnel/.pki/nssdb']);
		await cli.execa(
			'sudo',
			['certutil', '-d', '/root/tunnel/.pki/nssdb', '-N'],
			{
				stdio: 'inherit',
			},
		);

		/**
		@see https://github.com/microsoft/playwright/issues/4785#issuecomment-1133864469
	*/
		await cli.execa('pnpm', [
			'exec',
			'playwright',
			'screenshot',
			'-b',
			'chromium',
			'https://example.com',
			'/tmp/blank.png',
		], { stdio: 'inherit', cwd: packageDirpaths.playwrightTests });

		await cli.mkcert(['-install'], { stdio: 'inherit' });
		const keyFileName = 'test-key.pem';
		const certFileName = 'test-cert.pem';
		const localDomains = [
			'tunnel.test',
			'*.tunnel.test',
			'tunnelapp.test',
			'*.tunnelapp.test',
		];
		const mkcertCertsDirpath = path.join(os.homedir(), '.mkcert');
		await fs.promises.mkdir(mkcertCertsDirpath, { recursive: true });
		await cli.mkcert(
			['-key-file', keyFileName, '-cert-file', certFileName, ...localDomains],
			{ cwd: mkcertCertsDirpath, stdio: 'inherit' },
		);

		await cli.execa(
			'sudo',
			['systemctl', 'disable', 'systemd-resolved.service'],
			{ stdio: 'inherit' },
		);
		await cli.execa('sudo', ['systemctl', 'stop', 'systemd-resolved'], {
			stdio: 'inherit',
		});
	}

	// TODO: figure out how to kill it dynamically
	// await cli.execa('sudo', ['lsof', '-i', ':53'], { stdio: 'inherit' });
	// logger.debug('Process listening on port 53:', await portToPid(53));
	// await fkill(':53', { sudo: true, silent: true });
	// logger.debug('Process listening on port 53:', await portToPid(53));
	// logger.debug('Is port 53 available:', await checkPort(53));

	// TODO: start mprocs without CLI

	if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
		throw new Error('Missing NEXT_PUBLIC_CONVEX_URL');
	}

	void startWebapp({
		convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL,
		appEnv: 'test',
	});

	consola.info('Waiting for "https://tunnel.test" to be ready...');
	await pWaitFor(async () => {
		try {
			await ky.get('https://tunnel.test/api/health', {
				timeout: 500,
				retry: 0,
			});
			return true;
		} catch {
			return false;
		}
	}, { interval: 200 });

	consola.info('Running playwright tests...');
	const { success } = await runPlaywrightTests({ appEnv: 'test' });

	if (success) {
		process.exit(0);
	} else {
		consola.error('Playwright tests failed; see above for details');
		process.exit(1);
	}
}

test().then(() => {
	process.exit(0);
	// eslint-disable-next-line unicorn/prefer-top-level-await -- Doesn't exit sometimes
}).catch((error) => {
	consola.error('Test failed:', error);
	process.exit(1);
});
