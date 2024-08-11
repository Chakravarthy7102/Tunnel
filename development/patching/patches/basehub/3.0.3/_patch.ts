import { createPatchFileReplacer, definePatch } from '#utils/patch.ts';
import { outdent } from 'outdent';

export default definePatch({
	async patch({ temporaryPatchDirectory }) {
		const replace = createPatchFileReplacer({ temporaryPatchDirectory });
		await replace({
			files: 'index.d.ts',
			from: outdent`
				export * from "./dist/generated-client/index";
			`,
			to: outdent`
				export * from "./dist/generated-client/index.ts";
			`,
		});
	},
});
