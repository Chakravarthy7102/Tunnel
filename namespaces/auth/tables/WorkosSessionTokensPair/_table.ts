import { v } from '@-/convex/values';
import { table } from 'corvex';

export const WorkosSessionTokensPair = table(
	'WorkosSessionTokensPair',
	v.object({
		oldRefreshToken: v.string(),

		// New tokens
		refreshToken: v.string(),
		accessToken: v.string(),
	}),
	(t) => t.index('by_oldRefreshToken', ['oldRefreshToken']),
)({});
