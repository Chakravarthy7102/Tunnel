import { v } from '@-/convex/values';
import {
	protectedMutation,
	protectedQuery,
} from '@-/database/function-utils';
import { UnexpectedError } from '@-/errors';

/**
	Note: We don't check if a token pair is hard expired here because we want the query to be cacheable
*/
export const WorkosSessionTokenPair_get = protectedQuery(
	'WorkosSessionTokensPair',
	{
		args: {
			oldRefreshToken: v.string(),
		},
		async handler(ctx, { oldRefreshToken }) {
			const workosSessionTokenPair = await ctx.db.query(
				'WorkosSessionTokensPair',
			)
				.withIndex(
					'by_oldRefreshToken',
					(q) => q.eq('oldRefreshToken', oldRefreshToken),
				).first();

			if (workosSessionTokenPair === null) {
				return null;
			}

			return workosSessionTokenPair;
		},
		error: (error) =>
			new UnexpectedError('while getting session', { cause: error }),
	},
);

export const WorkosSessionTokenPair_create = protectedMutation(
	'WorkosSessionTokensPair',
	{
		args: {
			input: v.object({
				oldRefreshToken: v.string(),
				refreshToken: v.string(),
				accessToken: v.string(),
			}),
		},
		async handler(
			ctx,
			{ input: { oldRefreshToken, refreshToken, accessToken } },
		) {
			const id = await ctx.db.insert('WorkosSessionTokensPair', {
				oldRefreshToken,
				refreshToken,
				accessToken,
			});
			return id;
		},
		error: (error) =>
			new UnexpectedError('while creating session', { cause: error }),
	},
);
