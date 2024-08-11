import { cli } from '@-/cli-helpers';
import type { ProjectConfig } from '@-/demo-projects';
import isPortReachable from 'is-port-reachable';
import pWaitFor from 'p-wait-for';
import { chromium } from 'playwright';
import waitPort from 'wait-port';

export async function testDemoProject({
	demoProjectConfig,
}: {
	demoProjectConfig: ProjectConfig;
}) {
	await demoProjectConfig.install();
	const startCommand = await demoProjectConfig.getStartCommand();

	const process = cli.execaCommand(
		`tunneld -p ${demoProjectConfig.port} -- ${startCommand}`,
		{ stdio: 'inherit', cwd: demoProjectConfig.fixtureDirpath },
	);

	await waitPort({ port: demoProjectConfig.port, output: 'silent' });

	const browser = await chromium.launch({ headless: false });
	const page = await browser.newPage();
	await page.goto(`http://localhost:${demoProjectConfig.port}`);

	await page.waitForSelector('tunnel-toolbar');

	process.kill('SIGTERM');
	await isPortReachable(demoProjectConfig.port, { host: 'localhost' });

	// Wait for the port to be killed
	await pWaitFor(
		async () => {
			const isPortReachableResult = await isPortReachable(
				demoProjectConfig.port,
				{ host: 'localhost' },
			);
			return !isPortReachableResult;
		},
		{ timeout: 10_000, interval: 1000 },
	);
}
