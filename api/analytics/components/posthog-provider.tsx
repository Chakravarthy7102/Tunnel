'use client';

import { env } from '@-/env';
import { posthog } from 'posthog-js';
import { PostHogProvider as PostHogProviderOriginal } from 'posthog-js/react';

if (typeof window !== 'undefined') {
	posthog.init(env('NEXT_PUBLIC_POSTHOG_KEY'), {
		api_host: env('NEXT_PUBLIC_POSTHOG_HOST'),
		ui_host: env('NEXT_PUBLIC_POSTHOG_PROXY_HOST'),
	});
}

export function PosthogProvider({ children }: { children: React.ReactNode }) {
	return (
		<PostHogProviderOriginal client={posthog}>
			{children}
		</PostHogProviderOriginal>
	);
}
