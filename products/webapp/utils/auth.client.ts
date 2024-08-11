'use client';

import { useRouter } from 'next/navigation';
import { usePostHog } from 'posthog-js/react';
import { useCallback } from 'react';

export function useAuth() {
	const router = useRouter();
	const posthog = usePostHog();
	const signOut = useCallback(() => {
		posthog.reset();
		router.replace('/signout');
	}, [router, posthog]);

	return { signOut };
}
