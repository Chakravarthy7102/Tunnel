import { createPatchFileReplacer, definePatch } from '#utils/patch.ts';
import { outdent } from 'outdent';

export default definePatch({
	async patch({ temporaryPatchDirectory }) {
		const replace = createPatchFileReplacer({ temporaryPatchDirectory });
		await replace({
			files: 'lib/workos.js',
			from: [
				outdent`
					if (typeof (process === null || process === void 0 ? void 0 : process.emitWarning) !== 'function') {
				`,
				outdent`
					return process.emitWarning(warning, 'WorkOS');
				`,
			],
			to: [
				'if (true) {',
				'// $&',
			],
		});
	},
});
