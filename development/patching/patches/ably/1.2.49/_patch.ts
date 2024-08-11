import { createPatchFileReplacer, definePatch } from '#utils/patch.ts';
import glob from 'fast-glob';
import fs from 'node:fs';

export default definePatch({
	async patch({ temporaryPatchDirectory }) {
		const filepaths = await glob('**/*.d.ts', {
			cwd: temporaryPatchDirectory,
			absolute: true,
		});
		for (const filepath of filepaths) {
			let fileContents = fs.readFileSync(filepath, 'utf8');
			const relativeImports = fileContents.matchAll(/from '(.*\.\.)'/g);
			for (const relativeImport of relativeImports) {
				const specifier = relativeImport[1];
				if (specifier === undefined) {
					continue;
				}

				fileContents = fileContents.replace(
					relativeImport[0],
					`from '${specifier}/index.js'`,
				);
			}

			fs.writeFileSync(filepath, fileContents);
		}

		const replace = createPatchFileReplacer({ temporaryPatchDirectory });
		await replace({
			files: [
				'build/ably-commonjs.js',
				'build/ably.js',
				'build/ably-commonjs.noencryption.js',
				'build/ably-nativescript.js',
				'build/ably-reactnative.js',
				'build/ably-webworker.min.js',
				'build/ably.min.js',
				'build/ably.noencryption.js',
				'build/modules/index.js',
				'src/platform/web/lib/transport/fetchrequest.ts',
				'src/platform/web/lib/util/http.ts',
			],
			from: [
				'.fetch(',
				/platform_1.default.Config.xhrSupported/g,
				/platform_1.default.Config.jsonpSupported/g,
			],
			to: [
				';fetch(',
				'false',
				'false',
			],
		});
	},
});
