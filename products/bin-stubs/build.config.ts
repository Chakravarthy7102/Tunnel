import { generateBinStubs } from '#scripts/utils/generate.ts';
import { getTunnelCliSourceDirpath } from '@-/cli-source/dirpath';
import { packageDirpaths } from '@-/packages-config';
import { defineBuildConfig, getReleaseFromOptions } from '@-/unbuild';
import fs from 'node:fs';
import path from 'pathe';

export default defineBuildConfig({
	entries: [{
		input: 'exports/main.ts',
		platform: 'node',
		format: 'cjs',
	}],
	rollup: {
		inlineDependencies: true,
	},
	hooks: {
		async 'build:done'(ctx) {
			const distDirpath = ctx.options.outDir;
			const { release, version } = getReleaseFromOptions(ctx.options);
			await generateBinStubs(
				release === null ?
					{
						release: null,
						monorepoDirpath: packageDirpaths.monorepo,
					} :
					{
						release,
						tunnelCliSourceDirpath: getTunnelCliSourceDirpath({
							release,
							version,
						}),
					},
			);
			await fs.promises.cp(
				path.join(packageDirpaths.binStubs, 'generated/__stubs__'),
				path.join(distDirpath, '__stubs__'),
				{ recursive: true },
			);
		},
	},
});
