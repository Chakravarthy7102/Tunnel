#!/usr/bin/env tsx

// @ts-check

import { cli } from '@-/cli-helpers';
// import { readWantedLockfile } from '@pnpm/lockfile-file'
// import { satisfiesPackageManifest } from '@pnpm/lockfile-utils'
// import { readProjectManifest } from '@pnpm/read-project-manifest'
// import {
// 	getPackageDirpath,
// 	getPackageSlug,
// 	monorepoDirpath,
// 	packageNames
// } from '@-/packages-config'
// import chalk from 'chalk'
// import { outdent } from 'outdent'
// import invariant from 'tiny-invariant'
// import { checkCode } from '@-/code-qa';

const { stdout: gitBranch } = await cli.git('rev-parse --abbrev-ref HEAD', {
	stdout: 'pipe',
});

if (gitBranch === 'main') {
	/*
	const wantedLockfile = await readWantedLockfile(monorepoDirpath, {
		ignoreIncompatible: false
	})
	invariant(wantedLockfile !== null, 'lockfile should not be null')

	const packageNamesWithOutdatedLockfiles: string[] = []
	await Promise.all(
		Object.values(packageNames).map(async (packageName) => {
			const { manifest } = await readProjectManifest(
				getPackageDirpath({ packageName })
			)
			const id =
				packageName === packageNames.monorepo
					? '.'
					: getPackageRelativePath({ packageName })
			if (
				!satisfiesPackageManifest(wantedLockfile, manifest, id, {
					autoInstallPeers: true
				})
			) {
				packageNamesWithOutdatedLockfiles.push(packageName)
			}
		})
	)

	if (packageNamesWithOutdatedLockfiles.length > 0) {
		logger.error(
			outdent`
				Outdated lockfile; please run:

				${chalk.bold(
					`pnpm install ${packageNamesWithOutdatedLockfiles
						.map((packageName) => `--filter=${packageName}`)
						.join(' ')} --ignore-scripts`
				)}

				to update it before pushing to ${gitBranch}.
			`
		)
		process.exit(1)
	}
	*/
}

// logger.info('Lockfile up to date!')

if (gitBranch === 'main') {
	// await checkCode({
	// 	onlyShowErrors: true,
	// 	logs: 'summary',
	// 	runTests: false
	// });
}

const { stdout: porcelainOutput } = cli.execaCommandSync(
	'git status --porcelain',
);
if (porcelainOutput.trim() !== '') {
	// Run `git add .` again to include the code changes by the linter and formatter
	// await cli.git('add .');
	// TODO: only one git process may run at any one time
	// cli.git(['commit', '-m', 'chore: lint'])
	// cli.git('push --no-verify')
}
