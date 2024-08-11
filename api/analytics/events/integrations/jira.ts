import { getServerAnalyticsContext } from '#utils/context.ts';
import { defineServerEvent } from '#utils/event.ts';
import type { Id } from '@-/database';
import { $try, ok } from 'errok';

export const user_connectedJiraOrganization = defineServerEvent((
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
		event: 'user connected jira organization',
		distinctId: userId,
		groups: {
			organization: organizationId,
		},
	});

	return ok();
})));

export const user_disconnectedJiraOrganization = defineServerEvent((
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
		event: 'user disconnected jira organization',
		distinctId: userId,
		groups: {
			organization: organizationId,
		},
	});

	return ok();
})));

export const user_connectedJiraAccount = defineServerEvent((
	ctx,
	{ userId }: {
		userId: Id<'User'>;
	},
) => ($try(async function*() {
	const { posthog } = yield* getServerAnalyticsContext(ctx, {
		userId,
	}).safeUnwrap();

	posthog.capture({
		event: 'user connected jira account',
		distinctId: userId,
	});

	return ok();
})));

export const user_disconnectedJiraAccount = defineServerEvent((
	ctx,
	{ userId }: {
		userId: Id<'User'>;
	},
) => ($try(async function*() {
	const { posthog } = yield* getServerAnalyticsContext(ctx, {
		userId,
	}).safeUnwrap();

	posthog.capture({
		event: 'user disconnected jira account',
		distinctId: userId,
	});

	return ok();
})));

export const user_createdJiraIssue = defineServerEvent((
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
		event: 'user created jira issue',
		distinctId: userId,
		groups: {
			organization: organizationId,
		},
	});

	return ok();
})));
