import { cli } from '@-/cli-helpers';
import type { AppEnv } from '@-/env/app';
import { packageDirpaths } from '@-/packages-config';
import { build, buildPreset } from '@-/unbuild';
import type { Release } from '@tunnel/release';
import fs from 'node:fs';
import path from 'pathe';
import { buildCss } from './css.ts';

async function buildStaticAssets({ release }: { release: Release }) {
	if (release === null) {
		return;
	}

	await fs.promises.mkdir(
		path.join(packageDirpaths.webapp, 'public/__tunnel'),
		{ recursive: true },
	);

	// Remove the `__tunnel` development route handlers
	const routeHandlerDirnames = [
		'injection.js',
		'script.js',
		'toolbar.css',
		'toolbar.global.css',
		'toolbar.js',
	];

	await Promise.all(
		routeHandlerDirnames.map(async (routeHandlerDirname) =>
			fs.promises.rm(
				path.join(
					packageDirpaths.webapp,
					'app/%5F%5Ftunnel',
					routeHandlerDirname,
				),
				{ force: true, recursive: true },
			)
		),
	);

	if (process.env.CI) {
		await Promise.all([
			// Vercel needs us to copy all files from `@-/design/assets` to `public/assets` instead of using a symlink
			fs.promises.rm(path.join(packageDirpaths.webapp, 'public/assets'), {
				force: true,
				recursive: true,
			}).then(async () => (fs.promises.cp(
				path.join(packageDirpaths.assets, 'public'),
				path.join(packageDirpaths.webapp, 'public/assets'),
				{ recursive: true, force: true },
			))),

			// Building toolbar.{js,css,global.css}
			build(
				packageDirpaths.tunnelInstancePageToolbar,
				false,
				buildPreset({
					appEnv: 'production',
					release: 'production',
					version: '0.0.0',
				}),
			).then(async () => {
				const toolbarFilenames = [
					'toolbar.js',
					'toolbar.css',
					'toolbar.global.css',
				];
				await Promise.all(
					toolbarFilenames.map(async (toolbarFilename) =>
						fs.promises.cp(
							path.join(
								packageDirpaths.tunnelInstancePageToolbar,
								'.build',
								toolbarFilename,
							),
							path.join(
								packageDirpaths.webapp,
								'public/__tunnel',
								toolbarFilename,
							),
						)
					),
				);
			}),

			// Building /__tunnel/injection.js
			build(
				packageDirpaths.tunneledServiceWindowInjection,
				false,
				buildPreset({
					appEnv: 'production',
					release: 'production',
					version: '0.0.0',
				}),
			).then(async () =>
				fs.promises.cp(
					path.join(
						packageDirpaths.tunneledServiceWindowInjection,
						'.build/injection.js',
					),
					path.join(
						packageDirpaths.webapp,
						'public/__tunnel/injection.js',
					),
				)
			),

			// Building /__tunnel/script.js
			build(
				packageDirpaths.tunnelInstancePageScript,
				false,
				buildPreset({
					appEnv: 'production',
					release: 'production',
					version: '0.0.0',
				}),
			).then(async () =>
				fs.promises.cp(
					path.join(
						packageDirpaths.tunnelInstancePageScript,
						'.build/script.js',
					),
					path.join(
						packageDirpaths.webapp,
						'public/__tunnel/script.js',
					),
				)
			),

			// Building /__tunnel-service-worker.js
			build(
				packageDirpaths.tunnelInstancePageServiceWorker,
				false,
				buildPreset({
					appEnv: 'production',
					release: 'production',
					version: '0.0.0',
				}),
			).then(async () => {
				await fs.promises.cp(
					path.join(
						packageDirpaths.tunnelInstancePageServiceWorker,
						'.build/sw.js',
					),
					path.join(
						packageDirpaths.webapp,
						'public/__tunnel-service-worker.js',
					),
				);
			}),
		]);
	}
}

export async function buildWebapp(
	{ appEnv, release, convexUrl }: {
		appEnv: AppEnv;
		release: Release;
		convexUrl: string;
	},
) {
	// eslint-disable-next-line no-restricted-properties -- Guaranteed to be valid JSON
	const { version: databaseApiVersion } = JSON.parse(
		await fs.promises.readFile(
			path.join(packageDirpaths.database, 'convex.json'),
			'utf8',
		),
	);
	await Promise.all([
		cli.pnpm('exec basehub', { cwd: packageDirpaths.webapp }),
		buildCss({ watch: false }).then(async () =>
			cli.execa('pnpm', ['exec', 'next', 'build'], {
				stdio: 'inherit',
				cwd: packageDirpaths.webapp,
				reject: true,
				env: {
					NODE_OPTIONS: '--max-old-space-size=4096',
					APP_ENV: appEnv,
					NEXT_PUBLIC_APP_ENV: appEnv,
					NEXT_PUBLIC_TUNNEL_RELEASE: release ?? 'development',
					// `next build` expects NODE_ENV to always equal "production"
					NODE_ENV: 'production',
					NEXT_BUILD: '1',
					NEXT_PUBLIC_CONVEX_URL: convexUrl,
					NEXT_PUBLIC_TUNNEL_DATABASE_API_VERSION: databaseApiVersion,
				},
			})
		),
		buildStaticAssets({ release }),
	]);
}
