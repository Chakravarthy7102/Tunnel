import {
	getPackageCategory,
	getPackageName,
	packageDirpaths,
} from '@-/packages-config';
import type { Plugin } from 'esbuild';
import fs from 'node:fs';
import path from 'pathe';
import * as resolve from 'resolve.exports';

export default {
	name: 'publishable-only',
	setup(build) {
		// Whenever we resolve a monorepo package, we need to check if that package is marked "publishable"
		build.onResolve({ filter: /^@-\// }, async (args) => {
			const packageSlug = args.path.match(/^@-\/([^/]+)/)?.[1];
			if (packageSlug === undefined) {
				return {
					path: args.path,
				};
			}

			const packageName = getPackageName({ packageSlug });
			const packageCategory = getPackageCategory({ packageName });
			const packageDirpath = path.join(
				packageDirpaths.monorepo,
				packageCategory,
				packageSlug,
			);
			const packageJsonPath = path.join(
				packageDirpath,
				'package.json',
			);
			// eslint-disable-next-line no-restricted-properties -- Reading package.json
			const packageJson = JSON.parse(
				await fs.promises.readFile(packageJsonPath, 'utf8'),
			);

			const getFilePath = () => {
				const relativeImportPath = args.path.replace(
					`@-/${packageSlug}`,
					'.',
				);
				const relativeFilePaths =
					// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- Can return void
					resolve.exports(packageJson, relativeImportPath) ?? [];

				if (relativeFilePaths.length === 0) {
					throw new Error(`Could not resolve import ${args.path}`);
				}

				return path.join(
					packageDirpath,
					relativeFilePaths[0] as string,
				);
			};

			if (typeof packageJson.publishable === 'object') {
				if (packageJson.publishable === null) {
					throw new Error(
						`Package "${args.path}" is not publishable`,
					);
				}

				const subpath = args.path.replace(`@-/${packageSlug}`, '.');
				if (packageJson.publishable[subpath] !== true) {
					throw new Error(
						`Package "${args.path}" is not publishable`,
					);
				}

				return {
					path: getFilePath(),
				};
			}

			if (packageJson.publishable !== true) {
				throw new Error(`Package "${args.path}" is not publishable`);
			}

			return {
				path: getFilePath(),
			};
		});
	},
} satisfies Plugin;
