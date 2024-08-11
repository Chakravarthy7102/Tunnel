import { packageDirpaths } from '@-/packages-config';
import { defineBuildConfig, getReleaseFromOptions } from '@-/unbuild';
import * as swc from '@swc/core';
import fs from 'node:fs';
import { brotliCompress, gzip } from 'node:zlib';
import path from 'pathe';
import pify from 'pify';

export default defineBuildConfig({
	entries: [{
		input: 'entry/sw.ts',
		format: 'esm',
		name: 'sw',
	}],
	rollup: {
		inlineDependencies: true,
		output: {
			entryFileNames: '[name].js',
		},
	},
	hooks: {
		async 'build:done'(ctx) {
			const { release, version } = getReleaseFromOptions(ctx.options);
			if (release === 'production') {
				const unminifiedServiceWorkerJs = await fs.promises.readFile(
					path.join(
						packageDirpaths.tunnelInstancePageServiceWorker,
						'.build/sw.js',
					),
					'utf8',
				);

				const { code: serviceWorkerJs } = await swc.minify(
					unminifiedServiceWorkerJs,
				);

				if (!serviceWorkerJs) {
					throw new Error('Could not minify sw.js');
				}

				await fs.promises.writeFile(
					path.join(
						packageDirpaths.tunnelInstancePageServiceWorker,
						'.build/sw.js',
					),
					serviceWorkerJs,
				);

				const compressResources = version === '0.0.0';
				if (compressResources) {
					await Promise.all([
						(async () => {
							await fs.promises.writeFile(
								path.join(
									packageDirpaths.tunnelInstancePageServiceWorker,
									'.build/sw.js.br',
								),
								await pify(brotliCompress)(serviceWorkerJs),
							);
						})(),
						(async () => {
							await fs.promises.writeFile(
								path.join(
									packageDirpaths.tunnelInstancePageServiceWorker,
									'.build/sw.js.gz',
								),
								await (pify(gzip) as any)(serviceWorkerJs),
							);
						})(),
					]);
				}
			}
		},
	},
});
