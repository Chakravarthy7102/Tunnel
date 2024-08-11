import { defineBuildConfig, getReleaseFromOptions } from '@-/unbuild';
import fs from 'node:fs';
import path from 'pathe';

export default defineBuildConfig({
	entries: [
		{
			input: 'exports/main.ts',
			name: 'main',
		},
		{
			input: 'npm/',
			builder: 'mkdist',
			outDir: '.build',
		},
	],
	declaration: true,
	rollup: {
		inlineDependencies: true,
		emitCJS: true,
		dts: {
			tsconfig: './tsconfig.build.json',
		},
	},
	hooks: {
		async 'build:done'(ctx) {
			const { version } = getReleaseFromOptions(ctx.options);
			const distDirpath = ctx.options.outDir;

			await fs.promises.writeFile(
				path.join(distDirpath, 'package.json'),
				JSON.stringify(
					{
						name: '@tunnel/nextjs',
						version,
						type: 'module',
						main: 'main.cjs',
						module: 'main.mjs',
						types: 'main.d.ts',
						exports: {
							types: './main.d.ts',
							import: './main.mjs',
							require: './main.cjs',
						},
						peerDependencies: {
							'next': '>=13',
							'react': '^18',
						},
					},
					null,
					'\t',
				),
			);
		},
	},
});
