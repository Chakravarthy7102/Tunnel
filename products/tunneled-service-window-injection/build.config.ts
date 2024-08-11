import { defineBuildConfig, getReleaseFromOptions } from '@-/unbuild';
import * as swc from '@swc/core';
import fs from 'node:fs';
import { brotliCompress, gzip } from 'node:zlib';
import path from 'pathe';
import pify from 'pify';

export default defineBuildConfig({
	entries: [{
		input: 'entry/injection.ts',
		builder: 'esbuild',
		platform: 'browser',
		format: 'iife',
	}],
	hooks: {
		async 'build:done'(ctx) {
			const { release, version } = getReleaseFromOptions(ctx.options);
			const distDirpath = ctx.options.outDir;

			if (release === 'production') {
				const unminifiedInjectionJs = await fs.promises.readFile(
					path.join(distDirpath, 'injection.js'),
					'utf8',
				);

				// Minify using swc instead of esbuild for better results
				const { code: injectionJs } = await swc.minify(unminifiedInjectionJs);

				if (!injectionJs) {
					throw new Error('Could not minify injection/script.js');
				}

				await fs.promises.writeFile(
					path.join(distDirpath, 'injection.js'),
					injectionJs,
				);

				// We only compress resources if we're not publishing an npm package (i.e. version is 0.0.0)
				const compressResources = version === '0.0.0';
				if (compressResources) {
					await Promise.all([
						(async () => {
							await fs.promises.writeFile(
								path.join(distDirpath, 'injection.js.br'),
								await pify(brotliCompress)(injectionJs),
							);
						})(),
						(async () => {
							await fs.promises.writeFile(
								path.join(distDirpath, 'injection.js.gz'),
								await (pify(gzip) as any)(injectionJs),
							);
						})(),
					]);
				}
			}
		},
	},
});
