import { getServerAnalyticsContext } from '#utils/context.ts';
import { defineServerEvent } from '#utils/event.ts';
import type { Id } from '@-/database';
import { $try, ok } from 'errok';

export const user_connectedAsanaOrganization = defineServerEvent((
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
		event: 'user connected asana organization',
		distinctId: userId,
		groups: {
			organization: organizationId,
		},
	});

	return ok();
})));

export const user_disconnectedAsanaOrganization = defineServerEvent((
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
		event: 'user disconnected asana organization',
		distinctId: userId,
		groups: {
			organization: organizationId,
		},
	});

	return ok();
})));

export const user_connectedAsanaAccount = defineServerEvent((
	ctx,
	{ userId }: {
		userId: Id<'User'>;
	},
) => ($try(async function*() {
	const { posthog } = yield* getServerAnalyticsContext(ctx, {
		userId,
	}).safeUnwrap();

	posthog.capture({
		event: 'user connected asana account',
		distinctId: userId,
	});

	return ok();
})));

export const user_disconnectedAsanaAccount = defineServerEvent((
	ctx,
	{ userId }: {
		userId: Id<'User'>;
		organizationId: Id<'Organization'>;
	},
) => ($try(async function*() {
	const { posthog } = yield* getServerAnalyticsContext(ctx, {
		userId,
	}).safeUnwrap();

	posthog.capture({
		event: 'user disconnected asana account',
		distinctId: userId,
	});

	return ok();
})));

export const user_createdAsanaTask = defineServerEvent((
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
		event: 'user created asana task',
		distinctId: userId,
		groups: {
			organization: organizationId,
		},
	});

	return ok();
})));
