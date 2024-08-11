import { ApiConvex } from '@-/convex/api';
import type { SelectInput, SelectOutput } from '@-/database';
import { logger } from '@-/logger';
import { ApiUser } from '@-/user/api';
import type {
	NoUserInfo,
	UserInfo,
} from '@workos-inc/authkit-nextjs/dist/cjs/interfaces.js';
import { redirect } from 'next/navigation';

export async function WebappApiActor_from<
	$Include extends SelectInput<'User'>,
>(
	userPromise: Promise<UserInfo | NoUserInfo>,
	options: { redirectOnNull?: string | true; include: $Include },
): Promise<SelectOutput<'User', $Include>>;
export async function WebappApiActor_from<
	$Include extends SelectInput<'User'>,
>(
	userPromise: Promise<UserInfo | NoUserInfo>,
	options: { redirectOnNull: false; include: $Include },
): Promise<SelectOutput<'User', $Include> | null>;
export async function WebappApiActor_from<
	$Include extends SelectInput<'User'>,
>(
	userPromise: Promise<UserInfo | NoUserInfo>,
	options?: { redirectOnNull?: string | boolean; include?: $Include },
): Promise<SelectOutput<'User', $Include> | null> {
	const { user: workosUser } = await userPromise;
	const redirectOnNull = options?.redirectOnNull ?? '/login';

	const handleActorNotFound = (message: string) => {
		if (redirectOnNull === false) {
			return null;
		} else {
			const redirectUrl = redirectOnNull === true ? '/login' : redirectOnNull;
			logger.debug(
				`User is not logged in (${message}); redirecting to ${redirectUrl}`,
			);
			return redirect(redirectUrl);
		}
	};

	if (workosUser === null) {
		return handleActorNotFound('`workosUser` is null');
	} else {
		const userId = await ApiUser.ensureFromWorkosUser({
			input: { workosUser },
		}).unwrapOrThrow();

		return ApiConvex.v.User.get({
			from: { id: userId },
			include: options?.include ?? {},
		}).unwrapOrThrow() as any;
	}
}
