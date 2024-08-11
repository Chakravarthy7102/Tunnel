/*
	Since artillery only supports tests written in JavaScript + CommonJS, we need to transpile the tests before running them.
*/

import { packageDirpaths } from '@-/packages-config';
import * as esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'pathe';
import trimExtension from 'trim-extension';
import testFilepaths from './_.ts';

export async function buildTests() {
	const srcTestsDirpath = path.join(packageDirpaths.loadTesting, 'tests');
	const distTestsDirpath = path.join(
		packageDirpaths.loadTesting,
		'.build-tests',
	);

	await fs.promises.rm(distTestsDirpath, { recursive: true, force: true });
	await fs.promises.cp(srcTestsDirpath, distTestsDirpath, { recursive: true });

	await Promise.all(
		Object.keys(testFilepaths).map(async (testFilepath) => {
			const testRelativeFilepath = path.relative(
				'devops/load-testing/tests',
				testFilepath,
			);

			await esbuild.build({
				entryPoints: [path.join(srcTestsDirpath, testRelativeFilepath)],
				bundle: true,
				platform: 'node',
				format: 'cjs',
				target: 'node14',
				outfile: path.join(
					distTestsDirpath,
					trimExtension(testRelativeFilepath) + '.cjs',
				),
			});
		}),
	);
}
