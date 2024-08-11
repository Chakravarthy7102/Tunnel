import { createPatchFileReplacer, definePatch } from '#utils/patch.ts';
import { outdent } from 'outdent';

export default definePatch({
	async patch({ temporaryPatchDirectory }) {
		const replace = createPatchFileReplacer({ temporaryPatchDirectory });
		await replace({
			files: 'package.json',
			from: [
				',\n    "web-streams-polyfill": "^3.2.1"',
				'    "formdata-node": "^4.3.2",',
			],
			to: [
				'',
				'',
			],
		});

		await replace({
			files: '_shims/node-runtime.mjs',
			from: outdent`
				import { ReadableStream } from 'web-streams-polyfill/dist/ponyfill.es2018.js';
			`,
			to: '',
		});

		await replace({
			files: '_shims/node-runtime.js',
			from: [
				outdent`
					const ponyfill_es2018_js_1 = require("web-streams-polyfill/dist/ponyfill.es2018.js");
				`,
				outdent`
					ReadableStream: ponyfill_es2018_js_1.ReadableStream,
				`,
			],
			to: ['', 'ReadableStream,'],
		});
	},
});
