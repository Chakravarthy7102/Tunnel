import { defineBuildConfig, getReleaseFromOptions } from '@-/unbuild';
import { execa } from 'execa';
import fs from 'node:fs';
import path from 'pathe';

export default defineBuildConfig({
	entries: [
		{
			input: 'npm/',
			builder: 'mkdist',
			outDir: '.build',
		},
	],
	hooks: {
		async 'build:done'(ctx) {
			await Promise.all([
				// Generating type declarations from the .vue file
				execa(
					'pnpm',
					[
						'exec',
						'svelte-package',
						'-i',
						'components',
						'-o',
						'.build/components',
					],
					{ stdio: 'inherit' },
				).then(async () =>
					execa(
						'pnpm',
						[
							'exec',
							'svelte-package',
							'-i',
							'exports',
							'-o',
							'.build/exports',
						],
						{ stdio: 'inherit' },
					)
				),
				(async () => {
					const { version } = getReleaseFromOptions(ctx.options);
					const distDirpath = ctx.options.outDir;
					await fs.promises.writeFile(
						path.join(distDirpath, 'package.json'),
						JSON.stringify(
							{
								name: '@tunnel/svelte',
								version,
								type: 'module',
								main: 'main.cjs',
								module: 'main.mjs',
								types: 'main.d.ts',
								exports: {
									'.': {
										types: './main.d.ts',
										svelte: './exports/main.js',
										default: './main.js',
									},
								},
								peerDependencies: {
									'svelte': '^4',
								},
							},
							null,
							'\t',
						),
					);
				})(),
			]);
		},
	},
});
