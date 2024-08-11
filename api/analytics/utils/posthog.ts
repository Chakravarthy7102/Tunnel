import { env } from '@-/env';
import onetime from 'onetime';
import { PostHog } from 'posthog-node';

export const getPosthog = onetime((): PostHog => {
	const posthog = new PostHog(
		env('NEXT_PUBLIC_POSTHOG_KEY'),
		{
			host: env('NEXT_PUBLIC_POSTHOG_HOST'),
		},
	);

	return posthog;
});
