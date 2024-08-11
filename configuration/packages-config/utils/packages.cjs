/* eslint-disable no-undef -- what */

const { createMonorepoPackageHelpers } = require('monorepo-packages');
const packageJsonPathsPackage = require('./_.cjs');

const packageJsonPaths = packageJsonPathsPackage;
// dprint-ignore
const monorepoDirpath =
	// We don't use the monorepo dirpath in the browser
	typeof window !== 'undefined' ? '/' :
	process.env.NEXT_PUBLIC_TUNNEL_MONOREPO_DIRPATH ??
	process.env.TUNNEL_MONOREPO_DIRPATH ??
	// The monorepo dirpath is fixed on Vercel (when building the webapp)
	(process.env.VERCEL ? '/vercel/path0' : undefined);

if (monorepoDirpath === undefined) {
	throw new Error(
		'process.env.TUNNEL_MONOREPO_DIRPATH needs to be set',
	);
}

const {
	packageSlugpaths,
	packageSlugs,
	packageCategories,
	packageDirpaths,
	packageNames,
	getPackageCategory,
	getPackageRelativePath,
	packageNameToSlug,
	packageSlugToName,
	packageNameToDirpath,
	packageDirpathToName,
	getPackageKey,
	getPackageSlug,
	getPackageName,
	getPackageDirpath,
	getPackageJson,
	getPackageJsonSync,
	isMonorepoPackageImport,
	isMonorepoPackageName,
} = createMonorepoPackageHelpers({
	scope: '@-',
	monorepoDirpath,
	packageJsonPaths,
});

function getPackageSlugpath({ packageName }) {
	return `${getPackageCategory({ packageName })}/${
		getPackageSlug({
			packageName,
		})
	}`;
}

module.exports = {
	packageSlugpaths,
	packageSlugs,
	packageCategories,
	packageDirpaths,
	packageNames,
	getPackageCategory,
	getPackageRelativePath,
	packageNameToSlug,
	packageSlugToName,
	packageNameToDirpath,
	packageDirpathToName,
	getPackageKey,
	getPackageSlug,
	getPackageName,
	getPackageDirpath,
	getPackageJson,
	getPackageJsonSync,
	isMonorepoPackageImport,
	isMonorepoPackageName,
	getPackageSlugpath,
	monorepoDirpath,
};
