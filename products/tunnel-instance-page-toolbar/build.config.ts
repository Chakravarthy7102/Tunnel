import tailwindConfig from '@-/design-system/tailwind-config';
import { packageDirpaths } from '@-/packages-config';
import {
	defineBuildConfig,
	getReleaseFromOptions,
} from '@-/unbuild';
import * as swc from '@swc/core';
import type { Release } from '@tunnel/release';
import { sassPlugin } from 'esbuild-sass-plugin';
import postcssPlugin from 'esbuild-style-plugin';
import fs from 'node:fs';
import { brotliCompress, gzip } from 'node:zlib';
import { outdent } from 'outdent';
import path from 'pathe';
import pify from 'pify';
import tailwindcss from 'tailwindcss';
import { buildTunnelInstancePageToolbarGlobalCss } from './scripts/utils/build.ts';
// @ts-expect-error: no typings
import postcssImport from 'postcss-import';

export default defineBuildConfig({
	entries: [{
		input: 'entry/toolbar.ts',
		builder: 'esbuild',
		format: 'iife',
		platform: 'browser',
	}],
	hooks: {
		async 'esbuild:options'(ctx, options) {
			const { appEnv } = getReleaseFromOptions(ctx.options);

			// dprint-ignore
			options.banner = {
				js: outdent`
					"use strict";
					(() => {
						// We shadow \`console\` to prevent our logs from showing up
						${appEnv === 'production' ?
							outdent`
								var console = Object.fromEntries(
									Object.entries(window.console).map(([method, fn]) => [
										method,
										(...args) => {
											if (globalThis.__tunnelLog) {
												return fn.call(window.console, ...args);
											}
										}
									])
								);
							` : ''
						}

						// We shadow \`fetch\` to prevent our network requests from showing up in a comment
						var fetch = (resource, options) => {
							options ??= {}
							Object.defineProperty(options, '__TUNNEL_REQUEST__', {
								value: true,
								enumerable: false,
							});
							return window.fetch(resource, options);
						}
					`,
			};

			options.footer = {
				js: outdent`
					})()
				`,
			};

			options.plugins = [
				...(options.plugins ?? []),
				postcssPlugin({
					postcss: {
						plugins: [
							postcssImport(),
							tailwindcss(tailwindConfig),
						],
					},
				}),
				sassPlugin(),
			];
		},
		async 'build:done'(ctx) {
			const { release, version } = getReleaseFromOptions(ctx.options);
			// We only compress resources if we're not publishing an npm package (i.e. version is 0.0.0)
			const compressResources = version === '0.0.0';
			await Promise.all([
				processTunnelInstancePageToolbarJs({ release, compressResources }),
				processTunnelInstancePageToolbarCss({ release, compressResources }),
				buildTunnelInstancePageToolbarGlobalCss({ release, compressResources }),
			]);
		},
	},
});

async function processTunnelInstancePageToolbarJs({
	release,
	compressResources,
}: {
	release: Release;
	compressResources: boolean;
}) {
	if (release === 'production') {
		const unminifiedToolbarJs = await fs.promises.readFile(
			path.join(packageDirpaths.tunnelInstancePageToolbar, '.build/toolbar.js'),
			'utf8',
		);

		// Minify using swc instead of esbuild for better results
		const { code: toolbarJs } = await swc.minify(unminifiedToolbarJs);

		if (!toolbarJs) {
			throw new Error('Could not minify toolbar/script.js');
		}

		await fs.promises.writeFile(
			path.join(packageDirpaths.tunnelInstancePageToolbar, '.build/toolbar.js'),
			toolbarJs,
		);

		if (compressResources) {
			await Promise.all([
				(async () => {
					await fs.promises.writeFile(
						path.join(
							packageDirpaths.tunnelInstancePageToolbar,
							'.build/toolbar.js.br',
						),
						await pify(brotliCompress)(toolbarJs),
					);
				})(),
				(async () => {
					await fs.promises.writeFile(
						path.join(
							packageDirpaths.tunnelInstancePageToolbar,
							'.build/toolbar.js.gz',
						),
						await (pify(gzip) as any)(toolbarJs),
					);
				})(),
			]);
		}
	}
}

async function processTunnelInstancePageToolbarCss({
	compressResources,
}: {
	release: Release;
	compressResources: boolean;
}) {
	const unminifiedToolbarCss = await fs.promises.readFile(
		path.join(packageDirpaths.tunnelInstancePageToolbar, '.build/toolbar.css'),
		'utf8',
	);

	if (compressResources) {
		await Promise.all([
			(async () => {
				await fs.promises.writeFile(
					path.join(
						packageDirpaths.tunnelInstancePageToolbar,
						'.build/toolbar.css.br',
					),
					await pify(brotliCompress)(unminifiedToolbarCss),
				);
			})(),
			(async () => {
				await fs.promises.writeFile(
					path.join(
						packageDirpaths.tunnelInstancePageToolbar,
						'.build/toolbar.css.gz',
					),
					await (pify(gzip) as any)(unminifiedToolbarCss),
				);
			})(),
		]);
	}
}
