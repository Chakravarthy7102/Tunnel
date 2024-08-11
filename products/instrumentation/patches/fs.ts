import {
	getPackageMetaFromFilepath,
	getPackageMetaFromFilepathSync,
} from '#utils/package.ts';
import { getReplacedCodeFromReplacements } from '#utils/replace.ts';
import type { LocalProjectEnvironment } from '@-/local-project';
import {
	getPackageAugmentation,
	type PackageAugmentation,
} from '@-/package-augmentations';
import * as acorn from 'acorn';
import fs from 'node:fs';
import path from 'pathe';

const fs_readFileSync = fs.readFileSync;
const fs_readFile = fs.readFile;
const fs_promises_readFile = fs.promises.readFile;

const tunnelPatchedFsSymbol = Symbol('tunnel-patched-fs');

/**
	Patching `fs` is needed for making sure `webpack` reads the instrumented files
	(used for instrumenting vanilla JS code in `node_modules`)
*/
export function patchNodeFsMethods({
	localProjectEnvironment,
}: {
	localProjectEnvironment: LocalProjectEnvironment;
}) {
	// @ts-expect-error: Custom property
	if (fs[tunnelPatchedFsSymbol] === true) {
		return;
	}

	// @ts-expect-error: Custom property
	fs[tunnelPatchedFsSymbol] = true;

	const getAugmentedFileContents = ({
		fileContents,
		filepath,
		packageMeta,
		packageAugmentation,
	}: {
		fileContents: string;
		filepath: string;
		packageAugmentation: PackageAugmentation;
		packageMeta: { name: string; version: string; filepath: string };
	}) => {
		const relativeFilepath = path.relative(
			path.dirname(packageMeta.filepath),
			filepath,
		);

		const augmentations = packageAugmentation[relativeFilepath];

		if (augmentations?.instrumentation === undefined) {
			return fileContents;
		}

		const ast = acorn.parse(fileContents, {
			ecmaVersion: 2022,
			// TODO
			sourceType: 'module',
			allowHashBang: true,
		});

		const replacements = augmentations.instrumentation({
			ast,
			originalCode: fileContents,
			localProjectEnvironment,
		});

		const replacedCode = getReplacedCodeFromReplacements({
			ast,
			originalCode: fileContents,
			replacements,
		});

		return replacedCode;
	};

	fs.readFileSync = ((
		filepath: fs.PathOrFileDescriptor,
		encoding: fs.EncodingOption,
	) => {
		if (typeof filepath !== 'string') {
			return fs_readFileSync(filepath, encoding);
		}

		const fileContents = fs_readFileSync(filepath, encoding);
		const packageMeta = getPackageMetaFromFilepathSync(filepath);

		if (packageMeta !== null) {
			const packageAugmentation = getPackageAugmentation({
				packageName: packageMeta.name,
				packageVersion: packageMeta.version,
			});

			if (packageAugmentation !== null) {
				return getAugmentedFileContents({
					packageAugmentation,
					fileContents: fileContents.toString(),
					filepath,
					packageMeta,
				});
			}
		}

		return fileContents;
	}) as any;

	// @ts-expect-error: Correct
	fs.readFile = (filepath, optionsOrCallback, maybeCallback) => {
		if (typeof filepath !== 'string') {
			// @ts-expect-error: Correct type
			return readFile(filepath, optionsOrCallback, maybeCallback);
		}

		const options = typeof optionsOrCallback === 'function' ?
			{} :
			optionsOrCallback;
		const callback = typeof optionsOrCallback === 'function' ?
			optionsOrCallback :
			maybeCallback;

		return fs_readFile(filepath, options, (error, fileContents) => {
			if (error !== null) {
				callback(error, fileContents as any);
				return;
			}

			getPackageMetaFromFilepath(filepath)
				.then((packageMeta) => {
					if (packageMeta !== null) {
						const packageAugmentation = getPackageAugmentation({
							packageName: packageMeta.name,
							packageVersion: packageMeta.version,
						});

						if (packageAugmentation !== null) {
							callback(
								error,
								getAugmentedFileContents({
									packageAugmentation,
									fileContents: fileContents.toString(),
									filepath,
									packageMeta,
								}) as any,
							);
							return;
						}
					}

					callback(error, fileContents as any);
				})
				.catch((error) => {
					callback(error, null as any);
				});
		});
	};

	fs.promises.readFile = (async (
		...args: Parameters<typeof fs.promises.readFile>
	) => {
		if (typeof args[0] !== 'string') {
			return fs_promises_readFile(...args);
		}

		const fileContents = await fs_promises_readFile(...args);
		const filepath = args[0];

		const packageMeta = await getPackageMetaFromFilepath(filepath);
		if (packageMeta !== null) {
			const packageAugmentation = getPackageAugmentation({
				packageName: packageMeta.name,
				packageVersion: packageMeta.version,
			});

			if (packageAugmentation !== null) {
				return getAugmentedFileContents({
					packageAugmentation,
					fileContents: fileContents.toString(),
					filepath,
					packageMeta,
				});
			}
		}

		return fileContents;
	}) as any;
}
