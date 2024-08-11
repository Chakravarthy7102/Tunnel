import { defineBuildConfig } from '@-/unbuild';
import fs from 'node:fs';
import path from 'pathe';

export default defineBuildConfig({
	entries: [
		{
			input: 'exports/main.ts',
			builder: 'esbuild',
			platform: 'node',
			format: 'cjs',
		},
		{
			input: 'vendor/node.ts',
			platform: 'node',
			builder: 'esbuild',
			format: 'cjs',
		},
		{
			input: 'exports/tnl.ts',
			format: 'iife',
			builder: 'esbuild',
			platform: 'browser',
		},
		{
			input: 'exports/api.ts',
			format: 'cjs',
			builder: 'esbuild',
			platform: 'node',
		},
	],
	hooks: {
		async 'build:done'(ctx) {
			const distDirpath = ctx.options.outDir;
			await fs.promises.writeFile(
				path.join(distDirpath, 'package.json'),
				JSON.stringify({
					type: 'commonjs',
				}),
			);
		},
	},
});
