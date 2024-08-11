import type { ServerAnalyticsContext } from '#types';
import { ApiConvex } from '@-/convex/api';
import type { Id } from '@-/database';
import { DocumentNotFoundError, type UnexpectedError } from '@-/errors';
import { $try, err, ok, type ResultAsync } from 'errok';

export const getServerAnalyticsContext = (
	context: ServerAnalyticsContext,
	{ userId }: { userId: Id<'User'> | null },
): ResultAsync<
	ServerAnalyticsContext['__value__'],
	UnexpectedError | Error
> => ($try(async function*() {
	if (userId === null) {
		return ok(
			context as unknown as ServerAnalyticsContext['__value__'],
		);
	}

	const user = yield* ApiConvex.v.User.get({
		from: { id: userId },
		include: {},
	}).safeUnwrap();

	if (user === null) {
		return err(new DocumentNotFoundError('User'));
	}

	if (user.email.includes('+tunnel_test@')) {
		return err(new Error('User is a test user'));
	}

	return ok(context as unknown as ServerAnalyticsContext['__value__']);
}));
