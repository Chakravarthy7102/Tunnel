import { getServerAnalyticsContext } from '#utils/context.ts';
import { defineServerEvent } from '#utils/event.ts';
import type { Id } from '@-/database';
import { $try, ok } from 'errok';

export const user_connectedSlackWorkspace = defineServerEvent((
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
		event: 'user connected slack workspace',
		distinctId: userId,
		groups: {
			organization: organizationId,
		},
	});

	return ok();
})));

export const user_disconnectedSlackWorkspace = defineServerEvent((
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
		event: 'user disconnected slack workspace',
		distinctId: userId,
		groups: {
			organization: organizationId,
		},
	});

	return ok();
})));

export const user_connectedSlackAccount = defineServerEvent((
	ctx,
	{ userId }: {
		userId: Id<'User'>;
	},
) => ($try(async function*() {
	const { posthog } = yield* getServerAnalyticsContext(ctx, {
		userId,
	}).safeUnwrap();

	posthog.capture({
		event: 'user connected slack account',
		distinctId: userId,
	});

	return ok();
})));

export const user_disconnectedSlackAccount = defineServerEvent((
	ctx,
	{ userId }: {
		userId: Id<'User'>;
	},
) => ($try(async function*() {
	const { posthog } = yield* getServerAnalyticsContext(ctx, {
		userId,
	}).safeUnwrap();

	posthog.capture({
		event: 'user disconnected slack account',
		distinctId: userId,
	});

	return ok();
})));

export const user_createdSlackBroadcast = defineServerEvent((
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
		event: 'user created slack broadcast',
		distinctId: userId,
		groups: {
			organization: organizationId,
		},
	});

	return ok();
})));
