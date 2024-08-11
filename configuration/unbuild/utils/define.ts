import publishableOnly from '#plugins/publishable-only.ts';
import type { BuildConfig, BuildContext, EsbuildBuildEntry } from '#types';
import type { EnvironmentVariables } from '@-/env';
import type { AppEnv } from '@-/env/app';
import { packageDirpaths } from '@-/packages-config';
import { livereloadPlugin, notify } from '@jgoz/esbuild-plugin-livereload';
import type { Release } from '@tunnel/release';
import chokidar from 'chokidar';
import dotenv from 'dotenv';
import esbuild from 'esbuild';
import debounce from 'just-debounce';
import fs from 'node:fs';
import { outdent } from 'outdent';
import path from 'pathe';
import { build, defineBuildConfig as defineUnbuildConfig } from 'unbuild';
import {
	buildPreset,
	getPresetOptionsFromOptions,
	getReleaseFromOptions,
} from './release.ts';

const getReplacements = async (
	{ appEnv, release }: { appEnv: AppEnv; release: Release },
): Promise<
	& {
		[
			$Key in keyof typeof EnvironmentVariables as $Key extends
				`NEXT_PUBLIC_${string}` ? `process.env.${$Key}` : never
		]: string;
	}
	& {
		'process.env.CONVEX_URL': string;
		'process.env.NEXT_PUBLIC_CONVEX_URL': string;
		'process.env.NODE_ENV': string;
		'process.env.APP_ENV': string;
		'process.env.NEXT_PUBLIC_APP_ENV': string;
		'process.env.TUNNEL_RELEASE': string;
		'process.env.NEXT_PUBLIC_TUNNEL_RELEASE': string;
		'process.env.TUNNEL_MONOREPO_DIRPATH': string;
		'process.env.NEXT_PUBLIC_TUNNEL_MONOREPO_DIRPATH': string;
		'process.env.NEXT_PUBLIC_TUNNEL_DATABASE_API_VERSION': string;
	}
> => {
	// eslint-disable-next-line no-restricted-properties -- Guaranteed to be valid JSON
	const { version: databaseApiVersion } = JSON.parse(
		await fs.promises.readFile(
			path.join(packageDirpaths.database, 'convex.json'),
			'utf8',
		),
	);
	const convexUrl = release === null ?
		(() => {
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
				fs.readFileSync(convexEnvLocalFilepath),
			);

			if (CONVEX_URL === undefined) {
				throw new Error('Missing CONVEX_URL in .env.local');
			}

			return CONVEX_URL;
		})() :
		'https://ardent-husky-682.convex.cloud';

	return {
		'process.env.CONVEX_URL': JSON.stringify(convexUrl),
		'process.env.NEXT_PUBLIC_CONVEX_URL': JSON.stringify(convexUrl),
		'process.env.NODE_ENV': JSON.stringify(
			appEnv === 'production' ? 'production' : 'development',
		),
		'process.env.APP_ENV': JSON.stringify(appEnv),
		'process.env.NEXT_PUBLIC_APP_ENV': JSON.stringify(appEnv),
		'process.env.TUNNEL_RELEASE': JSON.stringify(release),
		'process.env.NEXT_PUBLIC_TUNNEL_RELEASE': JSON.stringify(
			release,
		),
		'process.env.NEXT_PUBLIC_GITLAB_APP_CLIENT_ID': JSON
			.stringify(
				appEnv === 'production' ?
					'8736553d1b01c7e2250d2ceb0b7a67ea088c2c4c7e477f2d2731ef05fba021fb' :
					'0d2eb7eed6399a1e12355c4031b77ad1e411491e195638c8140d65a2ef74dcf8',
			),
		'process.env.NEXT_PUBLIC_GH_OAUTH_APP_CLIENT_ID': JSON.stringify(
			'8a5076fba58a8d3e8793',
		),
		'process.env.NEXT_PUBLIC_POSTHOG_HOST': JSON.stringify(
			'https://app.posthog.com',
		),
		'process.env.NEXT_PUBLIC_POSTHOG_KEY': JSON.stringify(
			'phc_3nMI2OaCZ2qPaukHGWpGJ735T1NKxFcin0UqGrVgt9K',
		),
		'process.env.NEXT_PUBLIC_WORKOS_CLIENT_ID': JSON.stringify(
			appEnv === 'production' ?
				'client_01HT3JD8Q34DDEEFDS5YS1PJE5' :
				'client_01HT3JD85TK912GBH6D6D3K60C',
		),
		'process.env.NEXT_PUBLIC_POSTHOG_PROXY_HOST': JSON.stringify(
			'https://tunnel.dev/ingest',
		),
		'process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY': JSON.stringify(
			'pk_live_51JXol2HYzxnQtDKlpaUkrFkSpAm7onLtYwZaGnXOEPrAnp4bf093ACd9iHwS0MP4bGv8mgTwnIvRQsLeBGfjq4mx00rMx6uQH8',
		),
		// `process.env.NEXT_PUBLIC_TUNNEL_MONOREPO_DIRPATH` is an empty string so that `process.env.TUNNEL_MONOREPO_DIRPATH` takes priority
		'process.env.TUNNEL_MONOREPO_DIRPATH': JSON.stringify(''),
		'process.env.NEXT_PUBLIC_TUNNEL_MONOREPO_DIRPATH': JSON.stringify(''),
		'process.env.NEXT_PUBLIC_TUNNEL_DATABASE_API_VERSION': JSON.stringify(
			databaseApiVersion,
		),
	};
};

export function defineBuildConfig(config: BuildConfig) {
	return defineUnbuildConfig({
		...config as any,
		outDir: config.outDir ?? '.build',
		hooks: {
			async 'build:before'(ctx) {
				const { appEnv, release } = getReleaseFromOptions(ctx.options);

				ctx.options.replace = {
					...ctx.options.replace,
					...await getReplacements({ appEnv, release }),
				};
			},
			...config.hooks,
			// `unbuild` doesn't give a direct way to add custom builders, but we can abuse the `rollup:options` hook to add custom builders
			async 'rollup:options'(untypedCtx, rollupOptions) {
				const ctx = untypedCtx as BuildContext;
				await Promise.all(
					ctx.options.entries
						.filter((entry) => entry.builder === 'esbuild')
						.map(async (untypedEntry) => {
							const entry = untypedEntry as EsbuildBuildEntry;
							const { appEnv, release, version } = getReleaseFromOptions(
								ctx.options,
							);
							// We run `esbuild` seperately for each input
							const esbuildOptions: esbuild.BuildOptions = {
								bundle: true,
								minify: appEnv !== 'development',
								define: await getReplacements({ appEnv, release }),
								legalComments: 'none',
								external: entry.external,
								target: entry.target,
								platform: entry.platform,
								format: entry.format,
								entryPoints: [path.resolve(ctx.options.rootDir, entry.input)],
								plugins: [publishableOnly],
								absWorkingDir: ctx.options.rootDir,
								...(
									entry.outfile !== undefined ?
										{ outfile: entry.outfile } :
										{ outdir: ctx.options.outDir }
								),
							};

							if (entry.format !== 'esm') {
								esbuildOptions.inject = [
									path.join(
										packageDirpaths.unbuild,
										'stubs/import-meta-url.js',
									),
								];
								esbuildOptions.define = {
									...esbuildOptions.define,
									'import.meta.url': '__import_meta_url',
								};
							}

							// @ts-expect-error: Custom hook
							await ctx.hooks.callHook('esbuild:options', ctx, esbuildOptions);

							const options = getPresetOptionsFromOptions(ctx.options);

							if (options.injectHmr) {
								esbuildOptions.banner ??= {};
								esbuildOptions.banner.js = outdent`
									${esbuildOptions.banner.js ?? ''}
									(() => {
										if (typeof window === 'undefined') return;
										if (window.__ESBUILD_LR_PLUGIN__) return;
										window.__ESBUILD_LR_PLUGIN__ = 'http://127.0.0.1:53099/';
										const script = document.createElement('script');
										script.setAttribute('src', 'http://127.0.0.1:53099/livereload-event-source.js');
										script.setAttribute('type', 'module');
										document.head.appendChild(script);
									})();
								`;
							}

							try {
								if (options.watch) {
									esbuildOptions.banner ??= {};
									esbuildOptions.banner.js = outdent`
										${esbuildOptions.banner.js ?? ''}
										(() => {
											if (typeof window === 'undefined') return;
											if (window.__ESBUILD_LR_PLUGIN__) return;
											window.__ESBUILD_LR_PLUGIN__ = 'http://127.0.0.1:53099/';
											const script = document.createElement('script');
											script.setAttribute('src', 'http://127.0.0.1:53099/livereload-event-source.js');
											script.setAttribute('type', 'module');
											document.head.appendChild(script);
										})();
									`;
									esbuildOptions.metafile = true;
									esbuildOptions.write = true;
									esbuildOptions.plugins?.push(livereloadPlugin());

									const ctx = await esbuild.context(esbuildOptions);

									let previousCss = '';
									chokidar.watch(
										path.join(
											packageDirpaths.tunnelInstancePageToolbar,
											'.build/toolbar.css',
										),
									).on(
										'change',
										// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- Broken types
										(debounce.default ?? debounce)(async () => {
											const currentCss = await fs.promises.readFile(
												path.join(
													packageDirpaths.tunnelInstancePageToolbar,
													'.build/toolbar.css',
												),
												'utf8',
											);
											if (currentCss === previousCss) return;

											previousCss = currentCss;
											// eslint-disable-next-line no-console -- todo
											notify('', {
												added: [],
												removed: [],
												updated: ['/tunnel-instance-page-toolbar/toolbar.css'],
											});

											await build(
												process.cwd(),
												false,
												buildPreset({
													appEnv,
													release,
													version,
													options: {
														injectHmr: true,
													},
												}),
											);
										}, 500),
									);

									Object.defineProperty(esbuildOptions, 'ctx', {
										enumerable: false,
										value: ctx,
									});

									await ctx.rebuild();
									await ctx.watch();
								} else {
									await esbuild.build(esbuildOptions);
								}
							} catch (error) {
								// eslint-disable-next-line no-console -- bruh
								console.error('ESBuild error:', error);
								throw error;
							}
						}),
				);

				// Call the original hook
				await config.hooks?.['rollup:options']?.(untypedCtx, rollupOptions);
			},
		},
	});
}
