import type {
	FunctionEvent,
	FunctionExecutionEventId,
	OverloadedArgument,
} from '#types';
import { nanoid } from 'nanoid/non-secure';
import { createEvent } from './event.ts';
import { createTnlProperty } from './property.ts';
import { tnlProperties, tnlVariables } from './tnl-aliases.ts';
import { TNL__ } from './tnl.ts';

/**
	We keep a WeakMap of function references that have been overloaded so that we can check at runtime whether or not we can pass a modified
	first parameter to a certain function.

	We use a WeakMap so that these functions can be garbage collected if they go out of scope.
*/
export const overloadedFunctionReferenceToFunctionId = createTnlProperty(
	tnlProperties.overloadedFunctionReferenceToFunctionId,
	() => new WeakMap<Function, string>(),
);

export const tempFunctionEntry: any[] = createTnlProperty(
	tnlProperties.tempFunctionEntry,
	() => [] as any[],
);

export function registerOverloadedFunction(fn: Function) {
	const existingOverloadedFunctionId = overloadedFunctionReferenceToFunctionId
		.get(fn);
	if (existingOverloadedFunctionId !== undefined) {
		return { functionId: existingOverloadedFunctionId, fn };
	}

	const functionId = nanoid();

	overloadedFunctionReferenceToFunctionId.set(fn, functionId);

	return { functionId, fn };
}

export function handleFunctionInvocation(
	// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents -- self documenting
	args: [OverloadedArgument | unknown, ...unknown[]],
	getFunctionId: () => string,
) {
	const TNL__executionEventsIds: FunctionExecutionEventId[] = [];

	let invokedEvent: FunctionEvent<'invoked'>;
	let isMissingFirstParameter: boolean;
	const functionId = getFunctionId();
	const isOverloadedFirstArg = typeof args[0] === 'object' &&
		args[0] !== null &&
		// @ts-expect-error: Checking if the property exists on the object
		args[0][tnlVariables.TNL__symbol] === Symbol.for('TNL__symbol');

	if (isOverloadedFirstArg) {
		const overloadedArgument = args[0] as OverloadedArgument;
		isMissingFirstParameter = !Object.hasOwn(
			args[0] as object,
			tnlVariables.TNL__arg,
		);
		args[0] = overloadedArgument[tnlVariables.TNL__arg];

		const callerExecutionEventId =
			overloadedArgument[tnlVariables.TNL__callerExecutionEventId];

		invokedEvent = createEvent({
			eventId: nanoid(),
			functionLocation: null,
			// functionLocation: getCurrentLocation({
			// 	check: (loc) => !loc.file.includes('instrumentation'),
			// 	immediate: true
			// }),
			type: 'invoked',
			functionId,
			callerExecutionEventId,
			args: ['TODO'],
			executionEventsIds: TNL__executionEventsIds,
		});
	} // If a stacktrace wasn't passed as an argument, to prevent losing the stacktrace, we store it in the global events
	else {
		isMissingFirstParameter = false;
		invokedEvent = TNL__[tnlProperties.createEvent]({
			eventId: nanoid(),
			functionLocation: null,
			// functionLocation: getCurrentLocation({
			// 	check: (loc) => !loc.file.includes('instrumentation'),
			// 	immediate: true
			// }),
			type: 'invoked',
			functionId,
			callerExecutionEventId: null,
			args: ['TODO'],
			executionEventsIds: TNL__executionEventsIds,
		});
	}

	((globalThis as any)[tnlVariables.TNL__functionInvokedEvents][
		invokedEvent.eventId
	] ??= []).push(invokedEvent);

	return {
		[tnlVariables.TNL__isMissingFirstParameter]: isMissingFirstParameter,
		[tnlVariables.TNL__firstArg]: args[0],
		[tnlVariables.TNL__isOverloadedFirstArg]: isOverloadedFirstArg,
		[tnlVariables.TNL__currentFunctionScopeInvokedEventId]: '',
	};
}
