import { packageDirpaths } from '@-/packages-config';
import { defineBuildConfig, getReleaseFromOptions } from '@-/unbuild';
import { execa } from 'execa';

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
			const { appEnv } = getReleaseFromOptions(ctx.options);
			await execa('pnpm', [
				'exec',
				'ng',
				'build',
				...(appEnv === 'production' ?
					[
						'--configuration',
						'production',
					] :
					[]),
			], {
				cwd: packageDirpaths.angularPackage,
				stdio: 'inherit',
			});
		},
	},
});
