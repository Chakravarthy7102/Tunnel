import type { MutationCtx } from '#types';

export type MutationCtxWithoutDelete = Omit<MutationCtx, 'db'> & {
	db: Omit<MutationCtx['db'], 'delete'>;
};
