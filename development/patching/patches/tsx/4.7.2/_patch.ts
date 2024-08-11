import { createPatchFileReplacer, definePatch } from '#utils/patch.ts';
import { outdent } from 'outdent';

export default definePatch({
	async patch({ temporaryPatchDirectory }) {
		const replace = createPatchFileReplacer({ temporaryPatchDirectory });
		await replace({
			files: ['dist/cjs/index.cjs', 'dist/cjs/index.mjs'],
			from: 'enumerable:!1',
			to: outdent`
					$&,
					// We set this property as configurable so other packages can overwrite it if needed instead of erroring
					writable: true,
					configurable: true,
				`,
		});

		// We can't create IPC servers on read-only file systems
		await replace({
			files: ['dist/cli.cjs', 'dist/cli.mjs'],
			from: /await yn\(\)/g,
			to: '({ on() {} })',
		});

		await replace({
			files: ['dist/esm/index.mjs'],
			from: [/^/, '&&C();'],
			to: [
				outdent`
					import fs from 'node:fs';
					import path from 'node:path';
					import { createRequire } from 'node:module';
					import { isFileEsmSync } from 'is-file-esm-ts';
				`,
				outdent({ trimTrailingNewline: false })`
					// When the \`--import\` flag is used, Node.js tries to load the entrypoint using
					// ESM, which breaks for extension-less JavaScript files.
					// Thus, if we detect that the entrypoint is an extension-less file, we
					// short-circuit and load it via CommonJS instead.
					&&(() => {
						if (process.argv[1] !== undefined && path.extname(process.argv[1]) === '' && fs.existsSync(process.argv[1])) {
							try {
								if (isFileEsmSync(process.argv[1])) {
									import(process.argv[1]);
								} else {
									createRequire(import.meta.url)(process.argv[1]);
								}
							} catch {
								createRequire(import.meta.url)(process.argv[1]);
							}
						} else {
							C();
						}
					})();
				`,
			],
		});

		await replace({
			files: ['dist/esm/index.mjs', 'dist/esm/index.cjs'],
			from: /tsconfigRaw:(.*?)}/,
			to: outdent`
				tsconfigRaw:(() => {
					let tsconfig = $1;
					return {
						...tsconfig,
						compilerOptions: {
							...tsconfig?.compilerOptions,
							experimentalDecorators: true
						}
					};
				})()}
			`,
		});
	},
});
