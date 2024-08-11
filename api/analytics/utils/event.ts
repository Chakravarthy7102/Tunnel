import type { ServerAnalyticsContext } from '#types';
import type { ResultAsync } from 'errok';
import type { SetReturnType } from 'type-fest';

type OmitFirstArg<F> = F extends (x: any, ...args: infer P) => infer R ?
	(...args: P) => R :
	never;

export function defineServerEvent<
	$Function extends (
		context: ServerAnalyticsContext,
		...args: any[]
	) => ResultAsync<unknown, unknown>,
>(fn: $Function): SetReturnType<OmitFirstArg<$Function>, Promise<void>>;
export function defineServerEvent(fn: Function): Function {
	return fn;
}
