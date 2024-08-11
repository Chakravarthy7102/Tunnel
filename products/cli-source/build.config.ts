import type { AppEnv } from '@-/env/app';
import {
	getPackageDirpath,
	getPackageSlug,
	packageDirpaths,
	packageNames,
} from '@-/packages-config';
import {
	build,
	buildPreset,
	defineBuildConfig,
	getReleaseFromOptions,
} from '@-/unbuild';
import type { Release } from '@tunnel/release';
import fs from 'node:fs';
import path from 'pathe';

export default defineBuildConfig({
	entries: [{
		input: './entry/tunnel.ts',
		builder: 'esbuild',
		platform: 'node',
		outfile: '.build/entry/tunnel.js',
		format: 'cjs',
		external: ['fsevents'],
	}],
	hooks: {
		async 'build:done'(ctx) {
			const { appEnv, release, version } = getReleaseFromOptions(ctx.options);
			await buildDependencies({ release, version, appEnv });

			const packageJson = {
				name: '@tunnel/cli-source',
				version,
			};

			await fs.promises.writeFile(
				path.join(packageDirpaths.cliSource, '.build/package.json'),
				JSON.stringify(packageJson, null, '\t'),
			);
		},
	},
});

export async function buildDependencies({
	appEnv,
	version,
	release,
}: {
	appEnv: AppEnv;
	version: string;
	release: Release;
}) {
	const packageNamesToBuild = [
		packageNames.binStubs,
		packageNames.instrumentation,
		packageNames.tunneledServiceWindowInjection,
		packageNames.tunnelInstancePageToolbar,
		packageNames.tunnelInstancePageScript,
		packageNames.tunnelInstancePageServiceWorker,
		packageNames.packageAugmentations,
	];

	await Promise.all(
		packageNamesToBuild.map(async (packageName) => {
			try {
				await build(
					getPackageDirpath({ packageName }),
					false,
					buildPreset({ appEnv, release, version }),
				);
			} catch (error) {
				console.error(`Failed to build dependency ${packageName}:`, error);
				process.exit(1);
			}

			if (release === null) {
				await fs.promises.symlink(
					path.join(getPackageDirpath({ packageName }), '.build'),
					path.join(
						packageDirpaths.cliSource,
						'.build',
						getPackageSlug({ packageName }),
					),
				);
			} else {
				await fs.promises.cp(
					path.join(getPackageDirpath({ packageName }), '.build'),
					path.join(
						packageDirpaths.cliSource,
						'.build',
						getPackageSlug({ packageName }),
					),
					{ recursive: true },
				);
			}
		}),
	);
}
