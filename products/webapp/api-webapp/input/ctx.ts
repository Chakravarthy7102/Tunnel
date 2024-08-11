import type { Context } from '#types';

export function WebappApiInput_withCtx<T>(
	cb: (args: {
		ctx: Context;
		input: unknown;
	}) => T,
): T {
	return ((input: unknown, ctx: Context) => {
		const result = cb({ ctx, input });
		if (typeof result === 'function') {
			return result(input, ctx);
		} else {
			return result;
		}
	}) as any;
}
