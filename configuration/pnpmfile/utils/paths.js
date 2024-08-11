// @ts-check

const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const monorepoDirpath = path.join(__dirname, '../../..');
exports.monorepoDirpath = monorepoDirpath;

// Verify that `monorepoDirpath` is up-to-date
assert(
	fs.existsSync(path.join(monorepoDirpath, 'pnpm-workspace.yaml')),
	`The hardcoded \`monorepoDirpath\` variable is not up-to-date (${monorepoDirpath})`,
);

/** @type {Record<string, string[]>} */
const packageCategories = {
	monorepo: ['monorepo'],
	...Object.fromEntries(
		// eslint-disable-next-line no-restricted-properties -- No dependencies allowed for @-/pnpmfile
		JSON.parse(
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
						console.error(
							`Package at path \`${monorepoDirpath}/${packageCategory}/${packageSlug}\` does not contain a "package.json" or a "package.json5" file, deleting it...`,
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
