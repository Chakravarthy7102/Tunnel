import type { FunctionLocation } from '#types';

export type FunctionEventId<
	_$FunctionEventType extends FunctionEventType = FunctionEventType,
> = string & {
	__brand: 'FunctionEventId';
};

// dprint-ignore
export interface FunctionEventPayloads {
	invoked: {
		/**
			The function ID of the function that got invoked.
		*/
		functionId: string;
		functionLocation: FunctionLocation | null;

		args: unknown[];

		callerExecutionEventId: FunctionExecutionEventId | null

		/**
			All the events that this function triggers
		*/
		executionEventsIds: FunctionExecutionEventId[];
	},
	returned: {
		returnValue: unknown
	},
	call: {
		/**
			The function scope in which this function was called
		*/
		functionScope:
			// An ID is for identifying Tunnel-overloaded functions
			| { functionId: string }
			// A name is for identifying non-Tunnel-overloaded functions (determined at runtime using `.name`)
			| { name: string };

		/** The function being called might not be a Tunnel-overloaded function and thus won't have a function ID */
		callee:
			// An ID is for identifying Tunnel-overloaded functions
			| { functionId: string }
			// A name is for identifying non-Tunnel-overloaded functions (determined at runtime using `.name`)
			| { name: string };
		returnValue: unknown
	},
	render: {
		/**
			The parent function that rendered this component
		*/
		rendererFunction:
			// An ID is for identifying Tunnel-overloaded functions
			| { functionId: string }
			| { name: string }
		args: unknown[],

		source: {
			fileName: string
			lineNumber:  number
			columnNumber:  number
		}
	}
}

export type FunctionEventType = keyof FunctionEventPayloads;

export type FunctionEvent<
	$FunctionEventTypes extends FunctionEventType = FunctionEventType,
> = {
	[$FunctionEventType in $FunctionEventTypes]: {
		eventId: FunctionEventId<$FunctionEventType>;
		type: $FunctionEventType;
	} & FunctionEventPayloads[$FunctionEventType];
}[$FunctionEventTypes];

/**
	A function execution event is an event that is triggered when a function is executing (other than being invoked or returning).
*/
export type FunctionExecutionEvent = FunctionEvent<'call' | 'render'>;
export type FunctionExecutionEventId = FunctionEventId<'call' | 'render'>;
