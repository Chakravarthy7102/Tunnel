import type { PostHog } from 'posthog-node';

interface ServerContext<Value> {
	__type__: 'server';
	__value__: Value;
}

export type ServerAnalyticsContext = ServerContext<{
	posthog: PostHog;
}>;
