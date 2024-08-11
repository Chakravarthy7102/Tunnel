import { createPatchFileReplacer, definePatch } from '#utils/patch.ts';

export default definePatch({
	async patch({ temporaryPatchDirectory }) {
		const replace = createPatchFileReplacer({ temporaryPatchDirectory });
		await replace({
			files: 'index.d.ts',
			from: [
				/$/,
			],
			to: [
				'export = getXPath;',
			],
		});
	},
});
