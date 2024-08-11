import { createPatchFileReplacer, definePatch } from '#utils/patch.ts';
import { outdent } from 'outdent';

export default definePatch({
	async patch({ temporaryPatchDirectory }) {
		const replace = createPatchFileReplacer({ temporaryPatchDirectory });
		await replace({
			files: ['package.json'],
			from: outdent`
				"types": "index.d.ts",
			`,
			to: outdent`
							"types": "index.d.ts",
							"imports": { "#utils/*": "./utils/*", "#types": "./types/_.ts" },
				"exports": {
								".": {
									"types": "./index.d.ts",
									"default": "./dist/tippy.cjs.js"
								},
								"./dist": {
									"types": "./index.d.ts",
									"default": "./dist/tippy.cjs.js"
								}
							},
			`,
		});
	},
});
