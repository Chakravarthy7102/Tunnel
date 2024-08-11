'use client';

import { type EffectCallback, useEffect } from 'react';

export function useOnceEffect(cb: EffectCallback) {
	// eslint-disable-next-line react-hooks/exhaustive-deps -- We want to guarantee that the `useEffect` callback runs exactly once
	useEffect(cb, []);
}
