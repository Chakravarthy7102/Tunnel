import { cli } from '@-/cli-helpers';
import { packageDirpaths } from '@-/packages-config';
import path from 'pathe';

export async function lint({ fix }: { fix: boolean }) {
	const { exitCode } = await cli.pnpm(
		[
			'exec',
			path.join(packageDirpaths.codeQa, './bin/lint.ts'),
			...(fix ? ['--fix'] : []),
		],
		{
			cwd: packageDirpaths.codeQa,
			env: {
				NODE_OPTIONS: '--max-old-space-size=32768',
			},
			stdio: 'inherit',
			reject: false,
		},
	);

	return { exitCode };
}
