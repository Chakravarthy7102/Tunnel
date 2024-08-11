import { type Preloaded, usePreloadedQuery } from '@-/convex/react';
import type { FunctionReference } from '@-/convex/server';

export function useNullablePreloadedQuery<
	$Query extends FunctionReference<'query'>,
>(
	nullablePreloadedQuery: Preloaded<$Query> | null,
): $Query['_returnType'] | null {
	const result = usePreloadedQuery(
		nullablePreloadedQuery ??
			{
				_argsJSON: 'skip',
				_valueJSON: 'skip',
				_name: 'skip',
				__type: {} as $Query,
			},
	);

	if (nullablePreloadedQuery === null) {
		return null;
	}

	return result;
}
