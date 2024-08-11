import { createPatchFileReplacer, definePatch } from '#utils/patch.ts';
import { outdent } from 'outdent';

export default definePatch({
	async patch({ temporaryPatchDirectory }) {
		const replace = createPatchFileReplacer({ temporaryPatchDirectory });
		await replace({
			files: 'dist/lib/typescript/writeConfigurationDefaults.js',
			from: [
				'await _fs.promises.writeFile(tsConfigPath, _commentjson.stringify(userTsConfig, null, 2) + _os.default.EOL);',
				'await _fs.promises.writeFile(tsConfigPath, "{}" + _os.default.EOL);',
			],
			to: '// $&',
		});

		await replace({
			files: 'dist/server/lib/server-ipc/utils.js',
			from: 'const filterReqHeaders = (headers, forbiddenHeaders)=>{',
			to: outdent`
				const filterReqHeaders = (headers, forbiddenHeaders)=>{
					if (headers['content-length'] && headers['content-length'] === '0') {
						delete headers['content-length']
					}
			`,
		});

		const subpaths = [
			'script',
			'navigation',
			'server',
			'dynamic',
			'image',
			'link',
			'error',
			'document',
			'headers',
		];
		await replace({
			files: 'types/global.d.ts',
			from: [
				"readonly NODE_ENV: 'development' | 'production' | 'test'",
				/$/,
			],
			to: [
				'',
				subpaths.map((subpath) =>
					outdent`
						declare module "next/${subpath}" {
							const ${
						subpath.charAt(0).toUpperCase() + subpath.slice(1)
					}: typeof import('../${subpath}.js');
							export = ${subpath.charAt(0).toUpperCase() + subpath.slice(1)}
						}
					`
				).join('\n'),
			],
		});

		await replace({
			files: 'script.d.ts',
			from: "export * from './dist/client/script'\nexport default Script",
			to: 'export = Script',
		});

		await replace({
			files: 'dynamic.d.ts',
			from: 'export default dynamic',
			to: 'export = dynamic',
		});

		await replace({
			files: 'image.d.ts',
			from: 'export default Image',
			to: 'export = Image',
		});

		await replace({
			files: 'link.d.ts',
			from: 'export default Link',
			to: 'export = Link',
		});

		await replace({
			files: 'error.d.ts',
			from: 'export default Error',
			to: 'export = Error',
		});

		await replace({
			files: 'document.d.ts',
			from: 'export default Document',
			to: 'export = Document',
		});

		await replace({
			files: 'head.d.ts',
			from: 'export default Head',
			to: 'export = Head',
		});
	},
});
