import { createPatchFileReplacer, definePatch } from '#utils/patch.ts';
import { outdent } from 'outdent';

export default definePatch({
	async patch({ temporaryPatchDirectory }) {
		const replace = createPatchFileReplacer({ temporaryPatchDirectory });
		await replace({
			files: 'package.json',
			from: outdent`
				"exports": {
					".": {
			`,
			to: outdent`
				"exports": {
					".": {
						"types": "./dist/index.d.ts",
			`,
		});
	},
});
