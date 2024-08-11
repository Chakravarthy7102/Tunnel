import { getServerAnalyticsContext } from '#utils/context.ts';
import { defineServerEvent } from '#utils/event.ts';
import type { Id } from '@-/database';
import { $try, ok } from 'errok';

export const user_disconnectedTunnelInstanceProxyPreview = defineServerEvent(
	(
		ctx,
		{
			userId,
			organizationId,
			connectionDuration,
		}: {
			userId: Id<'User'>;
			organizationId: Id<'Organization'>;
			connectionDuration: bigint;
		},
	) => ($try(async function*() {
		const { posthog } = yield* getServerAnalyticsContext(ctx, {
			userId,
		}).safeUnwrap();

		posthog.capture({
			event: 'user disconnected tunnel instance proxy preview',
			distinctId: userId,
			groups: {
				'organization': organizationId,
			},
			properties: {
				connectionDuration: Number(connectionDuration),
			},
		});

		return ok();
	})),
);
