const fs = require('node:fs');
const path = require('pathe');
const destr = require('destru');

const { getMonorepoDirpath } = require('get-monorepo-root');
const monorepoDirpath = getMonorepoDirpath(__dirname);
if (monorepoDirpath === undefined) {
	throw new Error('Could not find monorepo directory');
}

exports.monorepoDirpath = monorepoDirpath;

const webappDirpath = path.join(monorepoDirpath, 'products/webapp');
exports.webappDirpath = webappDirpath;

const libraryPackageDirpath = path.join(monorepoDirpath, 'api/library');
exports.libraryPackageDirpath = libraryPackageDirpath;

const libraryDirpath = path.join(monorepoDirpath, 'api/library');
exports.libraryDirpath = libraryDirpath;

/** @type {Record<string, string[]>} */
const packageCategories = {
	monorepo: ['monorepo'],
	...Object.fromEntries(
		destr(
			fs.readFileSync(
				path.join(monorepoDirpath, 'pnpm-workspace.yaml'),
				'utf8',
			),
		)
			.packages.map((/** @type {string} */ packagePattern) =>
				packagePattern.replace(/\/\*$/, '')
			)
			// Some package categories might not exist on Docker
			.filter((/** @type {string} */ packageCategory) =>
				fs.existsSync(path.join(monorepoDirpath, packageCategory))
			)
			.map((/** @type {string} */ packageCategory) => {
				const packageSlugs = fs
					.readdirSync(path.join(monorepoDirpath, packageCategory))
					.filter((dir) => !dir.startsWith('.'));

				const ghostPackageSlugs = new Set();
				// Remove ghost packages that have been renamed
				for (const packageSlug of packageSlugs) {
					if (
						!fs.existsSync(
							path.join(
								monorepoDirpath,
								packageCategory,
								packageSlug,
								'package.json',
							),
						) &&
						!fs.existsSync(
							path.join(
								monorepoDirpath,
								packageCategory,
								packageSlug,
								'package.json5',
							),
						)
					) {
						// eslint-disable-next-line no-console -- Cannot use logger here
						console.error(
							`Package at path \`${monorepoDirpath}/${packageCategory}/${packageSlug}\` does not contain a "package.json" file, deleting it...`,
						);
						ghostPackageSlugs.add(packageSlug);
						fs.rmSync(
							path.join(monorepoDirpath, packageCategory, packageSlug),
							{
								recursive: true,
								force: true,
							},
						);
					}
				}

				return [
					packageCategory,
					packageSlugs.filter(
						(packageSlug) => !ghostPackageSlugs.has(packageSlug),
					),
				];
			}),
	),
};
exports.packageCategories = packageCategories;

const packageSlugToCategory = Object.fromEntries(
	Object.entries(packageCategories).flatMap(([category, packageNames]) =>
		packageNames.map((packageName) => [packageName, category])
	),
);
exports.packageSlugToCategory = packageSlugToCategory;

const packageDirpaths = Object.keys(packageCategories)
	.filter((packageCategory) =>
		fs.existsSync(path.join(monorepoDirpath, packageCategory))
	)
	.map((packageCategory) =>
		fs
			.readdirSync(path.join(monorepoDirpath, packageCategory))
			.filter((dirname) => !dirname.startsWith('.'))
			.map((dirname) => path.join(monorepoDirpath, packageCategory, dirname))
	);
exports.packageDirpaths = packageDirpaths;
