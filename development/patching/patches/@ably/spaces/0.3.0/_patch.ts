import { definePatch } from '#utils/patch.ts';
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
	},
});
