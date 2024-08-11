import { getServerAnalyticsContext } from '#utils/context.ts';
import { defineServerEvent } from '#utils/event.ts';
import type { Id } from '@-/database';
import { $try, ok } from 'errok';

export const user_connectedLinearWorkspace = defineServerEvent((
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
		event: 'user connected linear workspace',
		distinctId: userId,
		groups: {
			organization: organizationId,
		},
	});
	return ok();
})));

export const user_disconnectedLinearWorkspace = defineServerEvent((
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
		event: 'user disconnected linear workspace',
		distinctId: userId,
		groups: {
			organization: organizationId,
		},
	});

	return ok();
})));

export const user_connectedLinearAccount = defineServerEvent((
	ctx,
	{ userId }: {
		userId: Id<'User'>;
	},
) => ($try(async function*() {
	const { posthog } = yield* getServerAnalyticsContext(ctx, {
		userId,
	}).safeUnwrap();

	posthog.capture({
		event: 'user connected linear account',
		distinctId: userId,
	});

	return ok();
})));

export const user_disconnectedLinearAccount = defineServerEvent((
	ctx,
	{ userId }: {
		userId: Id<'User'>;
	},
) => ($try(async function*() {
	const { posthog } = yield* getServerAnalyticsContext(ctx, {
		userId,
	}).safeUnwrap();

	posthog.capture({
		event: 'user disconnected linear account',
		distinctId: userId,
	});

	return ok();
})));

export const user_createdLinearIssue = defineServerEvent((
	ctx,
	{ userId, organizationId }: {
		userId: Id<'User'>;
		organizationId: string;
	},
) => ($try(async function*() {
	const { posthog } = yield* getServerAnalyticsContext(ctx, {
		userId,
	}).safeUnwrap();

	posthog.capture({
		event: 'user created linear issue',
		distinctId: userId,
		groups: {
			organization: organizationId,
		},
	});

	return ok();
})));
