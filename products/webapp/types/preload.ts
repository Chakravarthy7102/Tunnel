import type { Preloaded } from '@-/convex/react';
import type { FunctionReference } from '@-/convex/server';

export type NonNullPreloaded<
	$FunctionReference extends FunctionReference<'query'>,
> = Preloaded<$FunctionReference> & {
	__type: {
		_returnType: {};
	};
};
