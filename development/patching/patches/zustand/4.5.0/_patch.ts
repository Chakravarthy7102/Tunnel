import { createPatchFileReplacer, definePatch } from '#utils/patch.ts';
import { outdent } from 'outdent';

export default definePatch({
	async patch({ temporaryPatchDirectory }) {
		const replace = createPatchFileReplacer({ temporaryPatchDirectory });
		await replace({
			files: ['esm/vanilla.d.mts', 'vanilla.d.ts'],
			from: outdent`
				type SetStateInternal<T> = {
						_(partial: T | Partial<T> | {
								_(state: T): T | Partial<T>;
						}['_'], replace?: boolean | undefined): void;
				}['_'];
			`,
			to: outdent`
				type SetStateInternal<T> = {
					_(partial: Partial<T> | {
							_<U extends T>(state: U): Partial<U>;
					}['_'], replace?: boolean | undefined): void;
				}['_'];
			`,
		});
	},
});
