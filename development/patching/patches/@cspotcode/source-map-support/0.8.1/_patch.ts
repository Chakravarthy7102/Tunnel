import { createPatchFileReplacer, definePatch } from '#utils/patch.ts';
import { outdent } from 'outdent';

export default definePatch({
	async patch({ temporaryPatchDirectory }) {
		const replace = createPatchFileReplacer({ temporaryPatchDirectory });
		await replace({
			files: 'source-map-support.js',
			from: outdent`
				var re = /(?:\/\/[@#][\s]*sourceMappingURL=([^\s'"]+)[\s]*$)|(?:\/\*[@#][\s]*sourceMappingURL=([^\s*'"]+)[\s]*(?:\*\/)[\s]*$)/mg;
			`,
			to: outdent`
				// See https://github.com/evanw/node-source-map-support/pull/86/files
				var re = /\/\/[#@]\s*sourceMappingURL=/mg;
			`,
		});

		await replace({
			files: 'source-map-support.js',
			from: outdent`
				return lastMatch[1];
			`,
			to: outdent`
				var begin = lastMatch.index + lastMatch[0].length;
				var end = fileData.indexOf("\n", begin);
				if (end < 0) end = fileData.length;
				while (end > begin && fileData[end - 1].match(/\s/)) end--;
				return fileData.substring(begin, end);
			`,
		});
	},
});
