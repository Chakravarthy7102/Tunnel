import { getTunnelCliSingleExecutableApplicationInstallationPath } from '#utils/installation-path.ts';
import type { SupportedTarget } from '@-/targets';
import { tunnelPublicPackagesMetadata } from '@-/tunnel-public-packages-metadata';
import { objectKeys } from '@tunnel/ts';
import download from 'downl';
import makeEmptyDir from 'make-empty-dir';
import ora from 'ora';

const cliSingleExecutableApplicationSupportedTargets = objectKeys(
	tunnelPublicPackagesMetadata['@tunnel/cli-single-executable-application']
		.supportedTargets,
);

export async function downloadTunnelCliSingleExecutableApplication({
	supportedTarget,
	version,
}: {
	supportedTarget:
		| SupportedTarget<
			typeof cliSingleExecutableApplicationSupportedTargets
		>
		| null;
	version: string;
}) {
	const setupSpinner = ora('🔥 Warming up the Tunnel CLI...').start();

	const tunnelCliSingleExecutableApplicationDirpath =
		getTunnelCliSingleExecutableApplicationInstallationPath({
			supportedTarget,
			version,
		});

	await makeEmptyDir(tunnelCliSingleExecutableApplicationDirpath, {
		recursive: true,
	});

	const cliSingleExecutableApplicationPackageName = supportedTarget === null ?
		`@tunnel/cli-single-executable-application` :
		`@tunnel/cli-single-executable-application-${supportedTarget}`;

	// Download `@-/cli-single-executable-application-${target}` into `~/.tunnel`
	const tarballUrl =
		`https://registry.npmjs.org/${cliSingleExecutableApplicationPackageName}/-/${
			cliSingleExecutableApplicationPackageName.replace(
				'@tunnel/',
				'',
			)
		}-${version}.tgz`;

	await download(tarballUrl, tunnelCliSingleExecutableApplicationDirpath, {
		extract: {
			strip: 1,
		},
	});

	setupSpinner.succeed('🔥 Tunnel CLI initialized!');
}
