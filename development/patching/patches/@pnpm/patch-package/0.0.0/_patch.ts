import { createPatchFileReplacer, definePatch } from '#utils/patch.ts';
import { outdent } from 'outdent';

export default definePatch({
	async patch({ temporaryPatchDirectory }) {
		const replace = createPatchFileReplacer({ temporaryPatchDirectory });
		await replace({
			files: 'dist/patch/parse.js',
			from: outdent`
				function verifyHunkIntegrity(hunk) {
			`,
			to: outdent`
				function verifyHunkIntegrity(hunk) {
				    return;
			`,
		});

		await replace({
			files: 'dist/patch/read.js',
			from: outdent`
				function readPatch({ patchFilePath, packageDetails, patchDir, }) {
					try {
						return parse_1.parsePatchFile(fs_extra_1.readFileSync(patchFilePath).toString());
					}
			`,
			to: outdent`
				function readPatch({ patch, packageDetails, patchDir, }) {
					try {
						return parse_1.parsePatchFile(patch);
					}
			`,
		});
	},
});
