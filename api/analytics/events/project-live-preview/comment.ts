import { getServerAnalyticsContext } from '#utils/context.ts';
import { defineServerEvent } from '#utils/event.ts';
import type { Id } from '@-/database';
import type { HostEnvironmentType } from '@-/host-environment';
import { $try, ok } from 'errok';

export const user_createdComment = defineServerEvent((
	ctx,
	{ userId, hostEnvironmentType, organizationId, commentThreadId }: {
		userId: Id<'User'>;
		hostEnvironmentType: HostEnvironmentType | null;
		organizationId: string;
		commentThreadId: string;
	},
) => ($try(async function*() {
	const { posthog } = yield* getServerAnalyticsContext(ctx, {
		userId,
	}).safeUnwrap();

	posthog.capture({
		event: 'user created comment',
		distinctId: userId,
		groups: {
			'organization': organizationId,
		},
		properties: {
			hostEnvironmentType,
			commentThread: commentThreadId,
		},
	});

	return ok();
})));
