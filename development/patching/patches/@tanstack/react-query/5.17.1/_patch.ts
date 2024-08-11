import { createPatchFileReplacer, definePatch } from '#utils/patch.ts';
import { outdent } from 'outdent';

export default definePatch({
	async patch({ temporaryPatchDirectory }) {
		const replace = createPatchFileReplacer({ temporaryPatchDirectory });
		await replace({
			files: 'build/modern/types.d.ts',
			from: outdent`
				mutate: UseMutateFunction<TData, TError, TVariables, TContext>;
			`,
			to: '// $&',
		});

		await replace({
			files: [
				'build/modern/queryClient-ZM0hKLC_.d.cts',
				'build/modern/queryClient-mVGWb1w6.d.ts',
			],
			from: outdent`
				mutate: MutateFunction<TData, TError, TVariables, TContext>;
			`,
			to: '// $&',
		});
	},
});
