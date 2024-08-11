import { cli } from '@-/cli-helpers';
import { packageDirpaths } from '@-/packages-config';
import path from 'pathe';

export async function buildCss({ watch }: { watch: boolean }) {
	const inputGlobalsCssFilepath = path.join(
		packageDirpaths.webapp,
		'styles/globals.css',
	);

	const outputGlobalsCssFilepath = path.join(
		packageDirpaths.webapp,
		'generated/globals.css',
	);

	const tailwindcssProcess = cli.execa(
		'pnpm',
		[
			'exec',
			'tailwindcss',
			...(watch ? ['--watch'] : []),
			'-i',
			inputGlobalsCssFilepath,
			'-o',
			outputGlobalsCssFilepath,
		],
		{ stdio: 'inherit', cwd: packageDirpaths.webapp },
	);

	if (!watch) {
		await tailwindcssProcess;
	}
}
