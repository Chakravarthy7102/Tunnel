import fc, { type Arbitrary, type ArrayConstraints } from 'fast-check';
import { _join } from './helpers.ts';

export * from 'fast-check';

/** string tuple */
export function stuple<$Tuples extends unknown[]>(
	...arbs: {
		[K in keyof $Tuples]: Arbitrary<$Tuples[K]>;
	}
): Arbitrary<string> {
	return fc.tuple(...arbs).map(_join);
}

/** string array */
export function sarray(
	arb: Arbitrary<string>,
	constraints?: ArrayConstraints,
): Arbitrary<string> {
	return fc.array(arb, constraints).map((a) => a.join(''));
}
