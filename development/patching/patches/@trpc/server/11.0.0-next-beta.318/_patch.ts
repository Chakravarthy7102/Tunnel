import { createPatchFileReplacer, definePatch } from '#utils/patch.ts';
import { outdent } from 'outdent';
// eslint-disable-next-line @tunnel/no-relative-import-paths/no-relative-import-paths -- todo
import { patchInputParser } from '../input-parser.ts';

export default definePatch({
	async patch({ temporaryPatchDirectory }) {
		await patchInputParser({ temporaryPatchDirectory });

		const replace = createPatchFileReplacer({ temporaryPatchDirectory });
		await replace({
			files: [
				'src/@trpc/server/index.ts',
				'dist/@trpc/server/index.d.ts',
			],
			from: outdent`
				} from '../../unstable-core-do-not-import';
			`,
			to: outdent`
				type QueryProcedure,
				type MutationProcedure,
				$&
			`,
		});
	},
});
