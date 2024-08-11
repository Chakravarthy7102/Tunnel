export { createDoc, createManyDoc } from '#utils/create.ts';
export { select } from '#utils/select.ts';
export { updateDoc } from '#utils/update.ts';

const noopActionSymbol = Symbol('noop-action');
export const noopAction = Object.assign((state: any) => state, {
	input: noopActionSymbol,
});

export type {
	AnyCollections,
	ClientBaseDoc,
	ClientDoc,
	ClientFlatDoc,
} from '#types';
