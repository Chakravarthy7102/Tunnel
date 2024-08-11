import { getDotTunnelDirpathSync } from '@-/dot-tunnel-directory';
import type { SupportedTarget } from '@-/targets';
import { tunnelPublicPackagesMetadata } from '@-/tunnel-public-packages-metadata';
import { objectKeys } from '@tunnel/ts';
import path from 'node:path';

const cliSingleExecutableApplicationSupportedTargets = objectKeys(
	tunnelPublicPackagesMetadata['@tunnel/cli-single-executable-application']
		.supportedTargets,
);

/**
	`@-/cli-single-executable-application` is installed in `~/.tunnel/cli-single-executable-application/${target}/${version}`, where ${target} can be equal to "untargeted" (we don't need to target different Node.js versions because it doesn't have any dependencies).
*/
export function getTunnelCliSingleExecutableApplicationInstallationPath({
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
	return path.join(
		getDotTunnelDirpathSync(),
		'cli-single-executable-application',
		supportedTarget ?? 'untargeted',
		version,
	);
}
