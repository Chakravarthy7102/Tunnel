import { createPatchFileReplacer, definePatch } from '#utils/patch.ts';
import { outdent } from 'outdent';

export default definePatch({
	async patch({ temporaryPatchDirectory }) {
		const replace = createPatchFileReplacer({ temporaryPatchDirectory });
		await replace({
			files: [
				'dist/tiny-invariant.js',
				'dist/tiny-invariant.esm.js',
				'dist/tiny-invariant.cjs.js',
			],
			from: outdent`
				var isProduction = process.env.NODE_ENV === 'production';
			`,
			to: outdent`
				var isProduction = false;
			`,
		});

		await replace({
			files: 'dist/tiny-invariant.min.js',
			from: outdent`
				throw new Error("Invariant failed")
			`,
			to: outdent`
				throw new Error("Invariant failed: " + (typeof n === 'function' ? n() : n))
			`,
		});
	},
});
