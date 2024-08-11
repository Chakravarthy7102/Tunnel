import { createPatchFileReplacer, definePatch } from '#utils/patch.ts';
import { outdent } from 'outdent';

export default definePatch({
	async patch({ temporaryPatchDirectory }) {
		const replace = createPatchFileReplacer({ temporaryPatchDirectory });
		await replace({
			files: 'src/index.js',
			from: outdent`
				require(adapters[adapter])
			`,
			to: outdent`
				({})
			`,
		});
	},
});
