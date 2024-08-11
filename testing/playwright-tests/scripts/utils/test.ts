import { cli } from '@-/cli-helpers';
import { packageDirpaths } from '@-/packages-config';
import { consola } from 'consola';
import ky from 'ky';

export async function runPlaywrightTests(
	{ appEnv }: { appEnv: 'test' | 'development' },
): Promise<{ success: true } | { success: false }> {
	// Make sure `tunnel.test` is running
	try {
		await ky.get('https://tunnel.test/api/health');
	} catch {
		consola.error(
			'Could not connect to `tunnel.test`; is `pnpm dev` running?',
		);
		process.exit(1);
	}

	const { exitCode } = await cli.pnpm([
		'exec',
		'playwright',
		'test',
		...process.argv.slice(2),
	], {
		cwd: packageDirpaths.playwrightTests,
		stdio: 'inherit',
		env: {
			APP_ENV: appEnv,
		},
		reject: false,
	});

	return exitCode === 0 ? { success: true } : { success: false };
}
