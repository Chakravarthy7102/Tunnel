import { defineBuildConfig, getReleaseFromOptions } from '@-/unbuild';
import * as swc from '@swc/core';
import fs from 'node:fs';
// import babel from '@babel/core';
// import * as esbuild from 'esbuild';
// import { resolve } from 'import-meta-resolve';
import path from 'pathe';

export default defineBuildConfig({
	entries: [
		{
			input: 'bin/tunnel.ts',
			builder: 'esbuild',
			format: 'cjs',
			platform: 'node',
			target: 'node10',
			outfile: '.build/bin/tunnel.js',
		},
		{
			input: 'npm/',
			builder: 'mkdist',
			outDir: '.build',
		},
	],
	hooks: {
		async 'build:done'(ctx) {
			const { release, version } = getReleaseFromOptions(ctx.options);
			const distDirpath = ctx.options.outDir;
			const binTunnelJsFilepath = path.join(distDirpath, 'bin/tunnel.js');

			// We use Babel to support older Node.js versions
			const _options = {
				plugins: [
					[
						'@babel/plugin-transform-runtime',
						{
							corejs: '3',
						},
					],
				],
				presets: [
					[
						'@babel/preset-env',
						{
							targets: {
								node: '10',
							},
						},
					],
				],
			};

			const transpiledBinTunnelJsCode = await fs.promises.readFile(
				binTunnelJsFilepath,
				'utf8',
			);

			// We re-bundle the transpiled code to inline "@babel/runtime"
			await fs.promises.writeFile(
				binTunnelJsFilepath,
				transpiledBinTunnelJsCode,
			);

			const bundledBinTunnelJsCode = await fs.promises.readFile(
				binTunnelJsFilepath,
				'utf8',
			);

			const { code: minifiedBinTunnelJsCode } = await swc.minify(
				bundledBinTunnelJsCode,
			);

			if (!minifiedBinTunnelJsCode) {
				throw new Error('Could not minify bin/tunnel.js');
			}

			await fs.promises.writeFile(binTunnelJsFilepath, minifiedBinTunnelJsCode);
			await fs.promises.chmod(binTunnelJsFilepath, 0o755);

			const packageName = release === 'staging' ?
				'@tunnel/cli-staging' :
				'@tunnel/cli';
			const packageVersion = version;

			await fs.promises.writeFile(
				path.join(distDirpath, 'package.json'),
				JSON.stringify(
					{
						name: packageName,
						type: 'commonjs',
						version: packageVersion,
						bin: release === 'staging' ?
							{ 'tunnel-staging': './bin/tunnel.js' } :
							release === null ?
							{ 'tunnel-development': './bin/tunnel.js' } :
							{ tunnel: './bin/tunnel.js' },
					},
					null,
					'\t',
				),
			);

			await fs.promises.writeFile(
				path.join(distDirpath, 'bin/tunnel.js'),
				release === 'staging' ?
					transpiledBinTunnelJsCode.replace(
						'"use strict";',
						'"use strict";process.env.TUNNEL_RELEASE="staging";',
					) :
					release === null ?
					transpiledBinTunnelJsCode.replace(
						'"use strict";',
						'"use strict";process.env.TUNNEL_RELEASE="development";',
					) :
					transpiledBinTunnelJsCode,
			);
		},
	},
});
