import { getServerAnalyticsContext } from '#utils/context.ts';
import { defineServerEvent } from '#utils/event.ts';
import type { Id } from '@-/database';
import { $try, ok } from 'errok';

export const user_connectedGitLabOrganization = defineServerEvent((
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
		event: 'user connected gitlab organization',
		distinctId: userId,
		groups: {
			organization: organizationId,
		},
	});

	return ok();
})));

export const user_disconnectedGitLabOrganization = defineServerEvent((
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
		event: 'user disconnected gitlab organization',
		distinctId: userId,
		groups: {
			organization: organizationId,
		},
	});

	return ok();
})));

export const user_connectedGitLabAccount = defineServerEvent((
	ctx,
	{ userId }: {
		userId: Id<'User'>;
	},
) => ($try(async function*() {
	const { posthog } = yield* getServerAnalyticsContext(ctx, {
		userId,
	}).safeUnwrap();

	posthog.capture({
		event: 'user connected gitlab account',
		distinctId: userId,
	});

	return ok();
})));

export const user_disconnectedGitLabAccount = defineServerEvent((
	ctx,
	{ userId }: {
		userId: Id<'User'>;
	},
) => ($try(async function*() {
	const { posthog } = yield* getServerAnalyticsContext(ctx, {
		userId,
	}).safeUnwrap();

	posthog.capture({
		event: 'user disconnected gitlab account',
		distinctId: userId,
	});

	return ok();
})));

export const user_linkGitLabRepository = defineServerEvent((
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
		event: 'user linked gitlab repository',
		distinctId: userId,
		groups: {
			organization: organizationId,
		},
	});

	return ok();
})));
