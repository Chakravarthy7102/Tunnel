import { createPatchFileReplacer, definePatch } from '#utils/patch.ts';
import { outdent } from 'outdent';

export default definePatch({
	async patch({ temporaryPatchDirectory }) {
		const replace = createPatchFileReplacer({ temporaryPatchDirectory });
		await replace({
			files: 'index.js',
			from: /^/,
			to: outdent`
				const Buffer = require('buffer/').Buffer;
			`,
		});

		await replace({
			files: 'package.json',
			from: '"dependencies": {},',
			to: outdent`
				"dependencies": {
					"buffer": "^6.0.3"
				},
			`,
		});
	},
});
