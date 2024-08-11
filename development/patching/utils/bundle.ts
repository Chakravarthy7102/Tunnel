import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { rollup } from 'rollup';
import esbuild from 'rollup-plugin-esbuild';

export async function createBundle(input: string) {
	const bundle = await rollup({
		input,
		plugins: [
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- bad typings
			esbuild({
				loaders: {
					'.ts': 'ts',
				},
				minify: true,
			}),
			nodeResolve({ preferBuiltins: true, browser: false }),
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- bad typings
			(commonjs.default ?? commonjs)({
				ignoreDynamicRequires: true,
			}),
		],
	});
	const { output } = await bundle.generate({
		format: 'commonjs',
	});
	return output[0].code;
}
