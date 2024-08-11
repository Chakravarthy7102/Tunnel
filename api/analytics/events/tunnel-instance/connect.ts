import { getServerAnalyticsContext } from '#utils/context.ts';
import { defineServerEvent } from '#utils/event.ts';
import type { Id } from '@-/database';
import { $try, ok } from 'errok';

export const user_connectedTunnelInstanceProxyPreview = defineServerEvent((
	ctx,
	{ userId, organizationId }: {
		userId: Id<'User'>;
		organizationId: Id<'Organization'>;
	},
) => ($try(async function*() {
	const { posthog } = yield* getServerAnalyticsContext(ctx, {
		userId,
	}).safeUnwrap();

	posthog.capture({
		event: 'user connected tunnel instance proxy preview',
		distinctId: userId,
		groups: {
			'organization': organizationId,
		},
	});

	return ok();
})));
