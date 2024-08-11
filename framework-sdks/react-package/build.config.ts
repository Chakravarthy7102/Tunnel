import { packageDirpaths } from '@-/packages-config';
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
			await fs.promises.writeFile(
				path.join(packageDirpaths.reactPackage, '.build/package.json'),
				JSON.stringify(
					{
						name: '@tunnel/react',
						version,
						type: 'module',
						main: 'main.cjs',
						module: 'main.mjs',
						types: 'main.d.ts',
						exports: {
							import: {
								types: './main.d.mts',
								default: './main.mjs',
							},
							require: {
								types: './main.d.cts',
								default: './main.cjs',
							},
						},
						peerDependencies: {
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
