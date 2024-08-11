// @ts-check

/**
	Our `pnpmfile.cjs` logic cannot use any external packages since it might be run when there are no dependencies installed.
*/

const fs = require('node:fs');
const path = require('node:path');
const invariant = require('../utils/tiny-invariant.js');
const { monorepoDirpath, packageSlugToCategory } = require('../utils/paths.js');
const { spawnSync } = require('node:child_process');

// custom pnpm `package/script`
if (
	process.argv[2] !== undefined &&
	/^([\w-]+)?\/[\w-]+$/.test(process.argv[2])
) {
	let packagePathslug;
	/** @type {string} */
	let scriptName;
	if (process.argv[2].startsWith('/')) {
		packagePathslug = path
			.relative(monorepoDirpath, process.cwd())
			.match(/^[^/]+\/[^/]+/)?.[0];
		scriptName = process.argv[2];
	} else {
		const packageSlug = process.argv[2].match(/^[^/]+/)?.[0];
		invariant(packageSlug !== undefined, 'packageSlug is not undefined');
		const packageCategory = packageSlugToCategory[packageSlug];
		invariant(
			packageCategory !== undefined,
			`${packageSlug} could not find package category for ${packageSlug}`,
		);
		packagePathslug = path.join(packageCategory, packageSlug);
		scriptName = process.argv[2].slice(packageSlug.length + 1);
	}

	const packageDirpath = packagePathslug === undefined ?
		monorepoDirpath :
		path.join(monorepoDirpath, packagePathslug);

	const extensions = ['.ts', '.mts', '.cts', '.js', '.mjs', '.cjs', ''];
	const scriptPath = extensions
		.map((extension) =>
			path.join(packageDirpath, 'scripts', scriptName + extension)
		)
		.find((scriptPath) => fs.existsSync(scriptPath));

	if (scriptPath === undefined) {
		console.error(
			`No script found at path "${
				path.join(
					packageDirpath,
					'scripts',
					scriptName,
				)
			}"`,
		);
		process.exit(1);
	}

	if (
		process.platform !== 'win32' &&
		// eslint-disable-next-line no-bitwise -- we need it
		!(fs.statSync(scriptPath).mode & fs.constants.S_IXUSR)
	) {
		console.error(`Script "${scriptPath}" is not executable.`);
		process.exit(1);
	}

	let spawnResult;
	if (process.platform === 'win32') {
		spawnResult = spawnSync(
			/** @type {string } */ (process.argv[0]),
			[scriptPath, ...process.argv.slice(3)],
			{
				stdio: 'inherit',
				cwd: packageDirpath,
			},
		);
	} else {
		spawnResult = spawnSync(scriptPath, process.argv.slice(3), {
			stdio: 'inherit',
			cwd: packageDirpath,
		});
	}

	if (spawnResult.status === undefined || spawnResult.status === null) {
		console.error(
			`Script "${scriptPath}" exited with signal "${spawnResult.signal}"`,
		);
		process.exit(1);
	} else {
		process.exit(spawnResult.status);
	}
}

if (process.env.CI) {
	// In CI, we modify pnpm-lock.yaml to prevent "ERR_PNPM_OUTDATED_LOCKFILE" errors
	const pnpmLockLines = fs.readFileSync(
		path.join(monorepoDirpath, 'pnpm-lock.yaml'),
		'utf8',
	).split('\n');
	const optionalDependenciesLineIndex = pnpmLockLines.findIndex((line) =>
		line.includes('optionalDependencies')
	);
	const startLineNumSpaces =
		(/** @type {string} */ (pnpmLockLines[optionalDependenciesLineIndex]))
			.match(/^\s+/)?.[0].length;
	const endOptionalDependenciesLineIndex = pnpmLockLines.findIndex(
		(line, index) => {
			if (index <= optionalDependenciesLineIndex) {
				return false;
			}

			const numSpaces = line.match(/^\s+/)?.[0].length;
			return numSpaces === startLineNumSpaces;
		},
	);

	const newPnpmLock = [
		...pnpmLockLines.slice(0, optionalDependenciesLineIndex + 1),
		...pnpmLockLines.slice(endOptionalDependenciesLineIndex),
	].join('\n');
	fs.writeFileSync(
		path.join(monorepoDirpath, 'pnpm-lock.yaml'),
		newPnpmLock,
	);
}

module.exports = {
	hooks: {
		/**
			@param {import('type-fest').PackageJson} pkg
		*/
		readPackage(pkg) {
			if (pkg?.name === '@-/monorepo' && process.env.CI) {
				delete pkg.optionalDependencies;
			}

			return pkg;
		},
	},
};
