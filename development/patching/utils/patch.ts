import type { Patch } from '#types';
import { patches } from '#utils/patches.ts';
import { createVariableWhitespaceRegexp } from '#utils/regex.ts';
import { cli } from '@-/cli-helpers';
import { logger } from '@-/logger';
import { packageDirpaths } from '@-/packages-config';
import path from 'pathe';
import * as replace from 'replace-in-file';
import tmp from 'tmp-promise';

export function definePatch(patch: Patch) {
	return patch;
}

export async function generatePatch({
	patchId,
}: {
	patchId: string;
}) {
	const temporaryPatchDirectory = await tmp.dir();
	const lastSlash = patchId.lastIndexOf('/');
	const packageToPatchWithVersion = patchId.slice(0, lastSlash) + '@' +
		patchId.slice(lastSlash + 1);
	const patch = patches[patchId as keyof typeof patches];

	await cli.pnpm(
		[
			'patch',
			packageToPatchWithVersion,
			'--edit-dir',
			temporaryPatchDirectory.path,
			'--ignore-existing',
		],
		{ cwd: packageDirpaths.monorepo, stdio: 'inherit' },
	);
	await patch.patch({ temporaryPatchDirectory: temporaryPatchDirectory.path });
	await cli.pnpm(
		[
			'patch-commit',
			temporaryPatchDirectory.path,
			'--patches-dir',
			path.relative(
				packageDirpaths.monorepo,
				path.join(packageDirpaths.patching, 'generated/patches'),
			),
		],
		{
			cwd: packageDirpaths.monorepo,
			stdio: 'inherit',
			env: { NODE_ENV: 'development', SKIP_TUNNEL_POSTINSTALL: '1' },
		},
	);

	if (patch.afterPatch !== undefined) {
		await patch.afterPatch({
			temporaryPatchDirectory: temporaryPatchDirectory.path,
		});

		await cli.pnpm(
			'install',
			{
				cwd: packageDirpaths.monorepo,
				stdio: 'inherit',
				env: { NODE_ENV: 'development', SKIP_TUNNEL_POSTINSTALL: '1' },
			},
		);
	}

	// temporaryPatchDirectory.cleanup();
}

export function createPatchFileReplacer({
	temporaryPatchDirectory,
}: {
	temporaryPatchDirectory: string;
}) {
	return async function(
		options: Parameters<(typeof replace)['replaceInFile']>[0],
	) {
		const result = await replace.default({
			...options,
			files: [options.files]
				.flat()
				.map((file) => path.join(temporaryPatchDirectory, file)),
			from: [options.from]
				.flat()
				.map((file) =>
					typeof file === 'string' ? createVariableWhitespaceRegexp(file) : file
				),
		});
		const unchangedFiles = result.filter((res) => !res.hasChanged);

		if (unchangedFiles.length > 0) {
			logger.info('Unchanged files:', unchangedFiles.map((res) => res.file));
		}
	};
}
