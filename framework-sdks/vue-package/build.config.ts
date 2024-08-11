import { defineBuildConfig, getReleaseFromOptions } from '@-/unbuild';
import vue from '@vitejs/plugin-vue';
import { execa } from 'execa';
import fs from 'node:fs';
import path from 'pathe';

export default defineBuildConfig({
	entries: [
		{
			input: './exports/main.ts',
			name: 'main',
		},
		{
			input: 'npm/',
			builder: 'mkdist',
			outDir: '.build',
		},
	],
	declaration: false,
	rollup: {
		inlineDependencies: true,
		emitCJS: true,
		dts: {
			tsconfig: './tsconfig.build.json',
		},
	},
	hooks: {
		'rollup:options'(ctx, rollupOptions) {
			// @ts-expect-error: `plugins` is guaranteed to be an array
			rollupOptions.plugins.push(vue());
		},
		async 'build:done'(ctx) {
			await Promise.all([
				// Generating type declarations from the .vue file
				execa('pnpm', ['exec', 'vue-tsc', '-p', 'tsconfig.build.json'], {
					stdio: 'inherit',
				}).then(async () =>
					fs.promises.rename(
						path.join(ctx.options.outDir, 'toolbar.vue.d.ts'),
						path.join(ctx.options.outDir, 'main.d.ts'),
					)
				).then(async () =>
					Promise.all([
						fs.promises.cp(
							path.join(ctx.options.outDir, 'main.d.ts'),
							path.join(ctx.options.outDir, 'main.d.cts'),
						),
						fs.promises.cp(
							path.join(ctx.options.outDir, 'main.d.ts'),
							path.join(ctx.options.outDir, 'main.d.mts'),
						),
					])
				),
				(async () => {
					const { version } = getReleaseFromOptions(ctx.options);
					const distDirpath = ctx.options.outDir;
					await fs.promises.writeFile(
						path.join(distDirpath, 'package.json'),
						JSON.stringify(
							{
								name: '@tunnel/vue',
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
									'vue': '^3',
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
