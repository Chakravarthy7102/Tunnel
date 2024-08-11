'use client';

import { useEffect, useRef } from 'react';

export function useRealtimeAction(
	action: any,
	setState: any,
): void {
	useEffect(() => {
		setState((state: any) => {
			state = action(state);
			for (const { action: pendingAction } of state.$pendingActions) {
				state = pendingAction(state);
			}

			return state;
		});
	}, [action, setState]);
}

export function useRealtimeActions(actions: any[], setState: any): void {
	const previousActions = useRef(actions);

	useEffect(() => {
		for (const [actionIndex, action] of actions.entries()) {
			if (action !== previousActions.current[actionIndex]) {
				previousActions.current[actionIndex] = action;
				setState((state: any) => {
					state = action(state);
					for (const { action: pendingAction } of state.$pendingActions) {
						state = pendingAction(state);
					}

					return state;
				});
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps -- We need to spread `actions`
	}, [...actions, setState]);
}
