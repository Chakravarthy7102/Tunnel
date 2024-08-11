import { defineBuildConfig, getReleaseFromOptions } from '@-/unbuild';
import fs from 'node:fs';
import path from 'pathe';

export default defineBuildConfig({
	entries: [{
		input: 'bin/',
		outDir: '.build/bin',
	}, {
		input: 'npm/',
		outDir: '.build/bin',
	}],
	hooks: {
		async 'build:done'(ctx) {
			const { version } = getReleaseFromOptions(ctx.options);
			const distDirpath = ctx.options.outDir;
			await fs.promises.writeFile(
				path.join(distDirpath, 'package.json'),
				JSON.stringify(
					{
						name: '@tunnel/cli-development',
						version,
						type: 'module',
						bin: {
							tunneld: './bin/tunneld',
							tunnels: './bin/tunnels',
							tunnelp: './bin/tunnelp',
						},
					},
					null,
					'\t',
				),
			);
		},
	},
});
