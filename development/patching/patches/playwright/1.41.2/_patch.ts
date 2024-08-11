import { createPatchFileReplacer, definePatch } from '#utils/patch.ts';
import { outdent } from 'outdent';

export default definePatch({
	async patch({ temporaryPatchDirectory }) {
		const replace = createPatchFileReplacer({ temporaryPatchDirectory });

		await replace({
			files: ['lib/transform/transform.js'],
			from: outdent`
				const {
					code,
					map
				} = babelTransform(originalCode, filename, isTypeScript, !!moduleUrl, pluginsPrologue, pluginsEpilogue);
			`,
			to: outdent`
				const esbuild = require('esbuild')
				const {
					code,
					map
				} = esbuild.transformSync(originalCode, { loader: 'ts' });
			`,
		});
	},
});
