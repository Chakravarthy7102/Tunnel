import * as packages from './packages.cjs';

export const {
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
} = packages;
