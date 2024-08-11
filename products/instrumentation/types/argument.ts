import type { tnlVariables } from '#utils/tnl-aliases.ts';
import type { FunctionExecutionEventId } from './event.ts';

export interface OverloadedArgument {
	[tnlVariables.TNL__symbol]: symbol;

	/**
		Might be null if the callee function is not a Tunnel overloaded function.
	*/
	[tnlVariables.TNL__callerExecutionEventId]: FunctionExecutionEventId | null;
	[tnlVariables.TNL__arg]: unknown;
}
