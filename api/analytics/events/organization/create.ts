import { getServerAnalyticsContext } from '#utils/context.ts';
import { defineServerEvent } from '#utils/event.ts';
import { ApiConvex } from '@-/convex/api';
import type { Id } from '@-/database';
import { $try, ok } from 'errok';

export const organization_created = defineServerEvent((
	ctx,
	{ userId, organizationName, organizationId }: {
		userId: Id<'User'>;
		organizationName: string;
		organizationId: Id<'Organization'>;
	},
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
		event: 'organizaton created',
		distinctId: user._id,
		groups: {
			organization: organizationId,
		},
	});

	posthog.groupIdentify({
		groupType: 'organization',
		groupKey: organizationId,
		properties: {
			name: organizationName,
		},
	});

	return ok();
})));
