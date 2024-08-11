import { type EffectCallback, useEffect } from 'react';

export function useOnceEffect(cb: EffectCallback) {
	useEffect(cb, []);
}
