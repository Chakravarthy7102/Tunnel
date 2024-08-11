'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { usePostHog } from 'posthog-js/react';
import { Suspense, useEffect } from 'react';

function PosthogPageViewInner() {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const posthog = usePostHog();

	useEffect(() => {
		if (pathname) {
			let url = window.origin + pathname;
			if (searchParams.toString()) {
				url += `?${searchParams.toString()}`;
			}

			posthog.capture(
				'$pageview',
				{ '$current_url': url },
			);
		}
	}, [pathname, searchParams, posthog]);

	return null;
}

export function PosthogPageView() {
	return (
		<Suspense fallback={null}>
			<PosthogPageViewInner />
		</Suspense>
	);
}

// Needs to be a default export as well because it's dynamically imported
export { PosthogPageView as default };
