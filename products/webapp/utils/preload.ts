import type { NonNullPreloaded } from '#types';
import { preloadedQueryResult } from '@-/convex/nextjs';
import type { Preloaded } from '@-/convex/react';

export function isNonNullPreloaded<$Preloaded extends Preloaded<any>>(
	preloadedResult: $Preloaded,
	// @ts-expect-error: works
): preloadedResult is NonNullPreloaded<$Preloaded['__type']> {
	return preloadedQueryResult(preloadedResult) !== null;
}
