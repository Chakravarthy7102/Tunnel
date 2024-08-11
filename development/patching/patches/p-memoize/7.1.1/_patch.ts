import { createPatchFileReplacer, definePatch } from '#utils/patch.ts';

export default definePatch({
	async patch({ temporaryPatchDirectory }) {
		const replace = createPatchFileReplacer({ temporaryPatchDirectory });
		await replace({
			files: 'dist/index.d.ts',
			from:
				'export default function pMemoize<FunctionToMemoize extends AnyAsyncFunction, CacheKeyType>(fn: FunctionToMemoize, { cacheKey, cache, }?: Options<FunctionToMemoize, CacheKeyType>): FunctionToMemoize;',
			to:
				'export default function pMemoize<FunctionToMemoize, CacheKeyType>(fn: FunctionToMemoize, { cacheKey, cache, }?: Options<FunctionToMemoize, CacheKeyType>): FunctionToMemoize;',
		});
	},
});
