import { action } from '#convex/_generated/server.js';
import { v } from '@-/convex/values';
import { createActionVctx } from './ctx.ts';

export const defineAction: typeof action = ({ args, handler }: any) => {
	return action({
		args: {
			...args,
			hash: v.optional(v.string()),
		},
		handler(ctx, args) {
			return handler(createActionVctx(ctx), args);
		},
	});
};
