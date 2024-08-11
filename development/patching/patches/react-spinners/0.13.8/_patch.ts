import { createPatchFileReplacer, definePatch } from '#utils/patch.ts';
import { outdent } from 'outdent';

export default definePatch({
	async patch({ temporaryPatchDirectory }) {
		const replace = createPatchFileReplacer({ temporaryPatchDirectory });

		await replace({
			files: 'ScaleLoader.d.ts',
			from: outdent`
				export default ScaleLoader
			`,
			to: outdent`
				export = ScaleLoader
			`,
		});
	},
});
