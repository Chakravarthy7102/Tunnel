import type { ArgsWithToken, QueryCtx } from '#types';
import { InvalidAuthError, MissingAuthError } from '@-/errors';
import { jwtDecode } from 'jwt-decode';

export async function getActorUser(ctx: QueryCtx, args: ArgsWithToken) {
	if ('token' in args && typeof args.token === 'string') {
		const payload = jwtDecode(args.token);
		if (!payload.sub) {
			throw new InvalidAuthError();
		}

		const user = await ctx.db.query('User').withIndex(
			'by_workosUserId',
			(q) => q.eq('workosUserId', payload.sub),
		).first();

		if (user === null) {
			throw new Error(`User with WorkOS ID ${payload.sub} not found`);
		}

		return user;
	} else {
		throw new MissingAuthError();
	}
}
