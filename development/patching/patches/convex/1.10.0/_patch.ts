import { createBundle } from '#utils/bundle.ts';
import { createPatchFileReplacer, definePatch } from '#utils/patch.ts';
import { join } from 'desm';
import { outdent } from 'outdent';

export default definePatch({
	async patch({ temporaryPatchDirectory }) {
		const replace = createPatchFileReplacer({ temporaryPatchDirectory });

		const bundledXxhashjs = await createBundle(
			join(import.meta.url, '../xxhashjs.cjs'),
		);

		await replace({
			files: [
				'dist/esm/react/use_paginated_query.js',
				'dist/cjs/react/use_paginated_query.js',
			],
			from: outdent`
				cursor: null,
			`,
			to: outdent`
				cursor: options?.initialCursor ?? null,
			`,
		});

		await replace({
			files: ['src/react/use_paginated_query.ts'],
			from: `
				options: { initialNumItems: number }
			`,
			to: `
				options: { initialNumItems: number, initialCursor?: string }
			`,
		});

		await replace({
			files: ['dist/esm-types/server/data_model.d.ts'],
			from:
				// eslint-disable-next-line no-template-curly-in-string -- false positive
				'export type FieldTypeFromFieldPath<Document extends GenericDocument, FieldPath extends string> = FieldPath extends `${infer First}.${infer Second}` ? ValueFromUnion<Document, First, Record<never, never>> extends GenericDocument ? FieldTypeFromFieldPath<ValueFromUnion<Document, First, Record<never, never>>, Second> : undefined : ValueFromUnion<Document, FieldPath, undefined>;',
			to:
				// eslint-disable-next-line no-template-curly-in-string -- false positive
				'export type FieldTypeFromFieldPath<Document extends GenericDocument, FieldPath extends string> = FieldPath extends `${infer First}.${infer Second}` ? NonNullable<ValueFromUnion<Document, First, Record<never, never>>> extends GenericDocument ? FieldTypeFromFieldPath<NonNullable<ValueFromUnion<Document, First, Record<never, never>>, Second>> : undefined : ValueFromUnion<Document, FieldPath, undefined>;',
		});

		// For some reason our custom `protectedQuery` and `protectedMutation` types don't extend `FunctionReference<any, "public">`
		await replace({
			files: [
				'dist/cli.bundle.cjs',
				'dist/cjs/cli/codegen_templates/api.js',
				'dist/esm/cli/codegen_templates/api.js',
			],
			from:
				'export declare const api: FilterApi<typeof fullApi, FunctionReference<any, "public">>;',
			to:
				'export declare const api: FilterApi<typeof fullApi, FunctionReference<any, any>>;',
		});

		await replace({
			files: [
				'dist/cli.bundle.cjs',
				'dist/cjs/cli/lib/config.js',
				'dist/esm/cli/lib/config.js',
			],
			from: outdent`
				const { config: localConfig, bundledModuleInfos } = await configFromProjectConfig(ctx, projectConfig, configPath, verbose);
			`,
			to: outdent`
				const _remoteConfig = await pullConfig(
					ctx,
					void 0,
					void 0,
					origin,
					options.adminKey
				);
				const { config: localConfig, bundledModuleInfos } = await configFromProjectConfig(ctx, projectConfig, configPath, verbose, _remoteConfig);
			`,
		});

		await replace({
			files: [
				'dist/cli.bundle.cjs',
				'dist/cjs/cli/lib/config.js',
				'dist/esm/cli/lib/config.js',
			],
			from: outdent`
				async function configFromProjectConfig(ctx, projectConfig, configPath, verbose) {
			`,
			to: outdent`
				async function configFromProjectConfig(ctx, projectConfig, configPath, verbose, _remoteConfig) {
			`,
		});

		// await replace({
		// 	files: [
		// 		'dist/cli.bundle.cjs',
		// 		'dist/cjs/cli/lib/config.js',
		// 		'dist/esm/cli/lib/config.js'
		// 	],
		// 	from: /const nodeResult = await bundle\(([\S\s]*?)\);/,
		// 	to: outdent`
		// 		const nodeResult = await bundle($1, _remoteConfig);
		// 	`
		// });

		await replace({
			files: [
				'dist/cli.bundle.cjs',
				'dist/cjs/bundler/index.js',
				'dist/esm/bundler/index.js',
			],
			from: /async function bundle\((.*?)\)/,
			to: outdent`
				async function bundle($1, _remoteConfig)
			`,
		});

		await replace({
			files: [
				'dist/cli.bundle.cjs',
				'dist/cjs/bundler/index.js',
				'dist/esm/bundler/index.js',
			],
			from: /const result = await doEsbuild\(([\S\s]*?)\);/,
			to: outdent`
				const result = await doEsbuild($1, _remoteConfig);
			`,
		});

		await replace({
			files: [
				'dist/cli.bundle.cjs',
				'dist/cjs/bundler/index.js',
				'dist/esm/bundler/index.js',
			],
			from: /async function doEsbuild\(((.*))\)/,
			to: 'async function doEsbuild($1, _remoteConfig)',
		});

		await replace({
			files: [
				'dist/cli.bundle.cjs',
				'dist/cjs/bundler/index.js',
				'dist/esm/bundler/index.js',
			],
			from: /const convexResult = await bundle\(([\S\s]*?)\);/,
			to: 'const convexResult = await bundle($1, "_deps", [], _remoteConfig);',
		});

		await replace({
			files: [
				'dist/cli.bundle.cjs',
				'dist/cjs/bundler/index.js',
				'dist/esm/bundler/index.js',
			],
			from: outdent`
				for (const [relPath, input] of Object.entries(result.metafile.inputs)) {
			`,
			to: outdent`
				try {
					const convexJson = JSON.parse(ctx.fs.readUtf8File('convex.json'));
					if (convexJson.version !== undefined && _remoteConfig !== undefined) {
						const getHash = (contents) => {
							globalThis.XXHash ??= ((module) => {${bundledXxhashjs};return module.exports})({});
							const hashBytes = Buffer.from(BigInt(globalThis.XXHash.h64(contents, 0x0).toString()).toString(16), 'hex').toString('base64');
							const hash = hashBytes.toString('base64').replace(/=/g, '');
							return hash;
						};
						const productionVersionNumber = Number((await (await fetch('https://tunnel.dev/api/cli-metadata')).json())['@-/database'].version);

						if (Number.isNaN(productionVersionNumber)) {
							throw new Error('Version in production should not be NaN');
						}

						let stagingVersionNumber;
						try {
							stagingVersionNumber = (await (await fetch('https://staging.tunnel.dev/api/cli-metadata')).json())['@-/database'].version;
						} catch (error) {
							console.error('Failed to fetch staging version number:', error);
							stagingVersionNumber = productionVersionNumber;
						}

						const newVersion = convexJson.version;
						const { resolve } = await import('node:path');
						const outputFilepaths = new Set(
							result.outputFiles.flatMap((outputFile) => [
								outputFile.path,
								outputFile.path.replace(/\\/v\\.js/g, '/v' + newVersion + '.js')
							])
						);

						const lowestFunctionsVersion = _remoteConfig.modules
							.filter((module) =>
								/^v\\d+\\.js$/.test(module.path) ||
								(
									module.path.startsWith('v') &&
									!module.path.startsWith('v/')
								)
							)
							.map((module) => {
								if (/^v\\d+\\.js$/.test(module.path)) {
									return Number(
										module.path
											.replace(/^v/, '')
											.replace(/\\.js$/, '')
									)
								} else {
									return Number(module.path.split('/')[0]);
								}
							})
							.sort()[0];

						const remoteModulesToKeep =
							_remoteConfig.modules.filter((module) => {
								// We need to include the \`_deps\` folder (unless we explicitly purge it)
								if (module.path.startsWith('_deps/')) {
									return true;
								}

								// The 'v/' folder is only used during development
								if (module.path.startsWith('v/') || module.path === 'v.js') {
									return false;
								}

								// Omit any filepaths that we want to update
								if (outputFilepaths.has(resolve(process.cwd(), 'out', module.path))) {
									return false;
								}

								if (module.path.startsWith('v')) {
									const functionsVersionString =
										/^v\\d+\\.js$/.test(module.path)
											? module.path.replace(/\\.js$/, '')
											: module.path.split('/')[0];

									const functionsVersionNumber = Number(functionsVersionString.slice(1));

									if (Number.isNaN(functionsVersionNumber)) {
										throw new Error('Function version should not be NaN');
									}

									// Include the versions currently on production and staging
									if (
										functionsVersionNumber === productionVersionNumber ||
										functionsVersionNumber === stagingVersionNumber
									) {
										return true;
									}

									// Include versions that are up to 3 versions higher than the one in staging or production (these might be in-progress deployments that haven't yet been deployed to staging, but we still want to keep them so they don't break staging when they are deployed)
									if (
										(
											functionsVersionNumber > productionVersionNumber &&
											functionsVersionNumber <= productionVersionNumber + 3
										) ||
										(
											functionsVersionNumber > stagingVersionNumber &&
											functionsVersionNumber <= stagingVersionNumber + 3
										)
									) {
										return true;
									}

									// Exclude all versions below the version in production except for the lowest version (since this version might be from a recent swap and is currently on staging)
									if (
										functionsVersionNumber < productionVersionNumber &&
										functionsVersionNumber !== lowestFunctionsVersion
									) {
										return false;
									}
								}

								// Exclude all other remote files (we only care about keeping the versioned functions and their dependencies)
								return false;
							});

						result.outputFiles = [
							...(
								process.env.PURGE_OLD_FUNCTIONS ?
									[] :
								remoteModulesToKeep.flatMap((module) => {
									const files = [
										{
											path: resolve(process.cwd(), 'out', module.path),
											contents: new TextEncoder().encode(module.source),
											hash: getHash(module.source),
											text: module.source
										}
									];

									// if (module.sourceMap !== undefined) {
									// 	files.push({
									// 		path: resolve(process.cwd(), 'out', module.path + '.map'),
									// 		contents: new TextEncoder().encode(module.sourceMap),
									// 		hash: getHash(module.sourceMap),
									// 		text: module.sourceMap
									// 	})
									// }

									return files;
								})
							),
							// Filter out original 'v/' functions in production as they are meant only for development
							...result.outputFiles.filter(
								(outputFile) => !outputFile.path.endsWith('/v.js')
							),
							...result.outputFiles
								.filter(
									(outputFile) => outputFile.path.endsWith('/v.js')
								)
								.map((outputFile) => ({
									...outputFile,
									path: outputFile.path.replace(/\\/v\\.js/g, '/v' + newVersion + '.js')
								})),
						];
					}
				} catch(error) {
					console.error('Error in custom build:', error)
				}

				$&
			`,
		});
	},
});
