import { useMemo } from 'react';

export function useMemoizedAction<$Action extends { input: unknown }>(
	action: $Action,
): $Action {
	return useMemo(() => action, [action.input]);
}
