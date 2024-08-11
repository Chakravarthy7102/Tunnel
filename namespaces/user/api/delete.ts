import { getWorkos } from '@-/auth/workos';
import { ApiConvex } from '@-/convex/api';
import type { Id } from '@-/database';
import { $try, err, ok, ResultAsync } from 'errok';

export const ApiUser_delete = (
	{ input }: { input: { id: Id<'User'> } },
) => ($try(async function*() {
	const user = yield* ApiConvex.v.User.get({
		from: { id: input.id },
		include: {},
	}).safeUnwrap();

	if (user?.workosUserId) {
		const workos = getWorkos();
		const deleteResult = await ResultAsync.fromPromise(
			workos.userManagement.deleteUser(
				user.workosUserId,
			),
			(error) => error as Error & { code: string },
		);

		if (deleteResult.isErr()) {
			// Ignore "Organization not found" errors
			if (deleteResult.error.code !== 'entity_not_found') {
				return err(deleteResult.error);
			}
		}
	}

	return ok();
}));
