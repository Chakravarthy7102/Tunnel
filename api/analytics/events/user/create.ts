import { getServerAnalyticsContext } from '#utils/context.ts';
import { defineServerEvent } from '#utils/event.ts';
import { ApiConvex } from '@-/convex/api';
import type { Id } from '@-/database';
import { $try, ok } from 'errok';

export const user_created = defineServerEvent((
	ctx,
	{ userId }: { userId: Id<'User'> },
) => ($try(async function*() {
	const { posthog } = yield* getServerAnalyticsContext(ctx, {
		userId,
	}).safeUnwrap();
	const user = yield* ApiConvex.v.User.get({
		from: { id: userId },
		include: {},
	}).safeUnwrap();

	if (user === null) {
		return ok();
	}

	posthog.capture({
		event: 'user_created',
		distinctId: user._id,
	});

	return ok();
})));
