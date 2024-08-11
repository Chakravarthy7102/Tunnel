import { defineBuildConfig, getReleaseFromOptions } from '@-/unbuild';
import * as swc from '@swc/core';
import fs from 'node:fs';
import { brotliCompress, gzip } from 'node:zlib';
import path from 'pathe';
import pify from 'pify';

export default defineBuildConfig({
	entries: [{
		input: 'entry/script.ts',
		builder: 'esbuild',
		platform: 'browser',
		format: 'iife',
	}],
	hooks: {
		async 'build:done'(ctx) {
			const { release, version } = getReleaseFromOptions(ctx.options);
			const distDirpath = ctx.options.outDir;

			if (release === 'production') {
				const unminifiedScriptJs = await fs.promises.readFile(
					path.join(distDirpath, 'script.js'),
					'utf8',
				);

				// Minify using swc instead of esbuild for better results
				const { code: scriptJs } = await swc.minify(unminifiedScriptJs);

				if (!scriptJs) {
					throw new Error('Could not minify script.js');
				}

				await fs.promises.writeFile(
					path.join(distDirpath, 'script.js'),
					scriptJs,
				);

				const compressResources = version === '0.0.0';
				if (compressResources) {
					await Promise.all([
						(async () => {
							await fs.promises.writeFile(
								path.join(distDirpath, 'script.js.br'),
								await pify(brotliCompress)(scriptJs),
							);
						})(),
						(async () => {
							await fs.promises.writeFile(
								path.join(distDirpath, 'script.js.gz'),
								await (pify(gzip) as any)(scriptJs),
							);
						})(),
					]);
				}
			}
		},
	},
});
