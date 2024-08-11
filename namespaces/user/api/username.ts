import { ApiUser } from '#api';
import { ApiConvex } from '@-/convex/api';
import { $try, ok } from 'errok';
import randomInteger from 'random-int';

/**
	TODO: Case sensitivity
*/
export const ApiUser_isUsernameAvailable = (
	username: string,
) => ($try(async function*() {
	const user = yield* ApiConvex.v.User.get({
		from: { username },
		include: {},
	}).safeUnwrap();
	return ok(user === null);
}));

export const ApiUser_generateUsername = (
	{ email }: { email: string },
) => ($try(async function*() {
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- emails always have '@'
	const emailUsername = email.split('@')[0]!;
	const username = emailUsername.replaceAll(/[^\dA-Za-z]/g, '');
	if (yield* ApiUser.isUsernameAvailable(username).safeUnwrap()) {
		return ok(username);
	} else {
		return ok(username + randomInteger(1000).toString());
	}
}));
