import { createPatchFileReplacer, definePatch } from '#utils/patch.ts';

export default definePatch({
	async patch({ temporaryPatchDirectory }) {
		const replace = createPatchFileReplacer({ temporaryPatchDirectory });
		await replace({
			files: 'dist/index.d.ts',
			from: [
				'export default function isUtf8(buf?: Buffer | Uint8Array): boolean;',
				/$/,
			],
			to: [
				'export default function isUtf8(buf?: Buffer | Uint8Array | ArrayBuffer): boolean;',
				'export = isUtf8;',
			],
		});
	},
});
