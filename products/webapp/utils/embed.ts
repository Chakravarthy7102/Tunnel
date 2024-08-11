'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function isPageInIframe() {
	try {
		return window.self !== window.top;
	} catch {
		return true;
	}
}

export function useEmbedPage() {
	const router = useRouter();
	// Don't let the user open the embed as a URL
	useEffect(() => {
		if (!isPageInIframe()) {
			router.replace('/home');
		}
	}, [router]);
}
