import { nanoid } from 'nanoid/non-secure';
import { createEvent, getEvent } from './event.ts';
import { overloadedFunctionReferenceToFunctionId } from './function.ts';
import { jsxDEVFunctions } from './react.ts';
import { sourceToRenderEventIdMap } from './source.ts';
import { tnlVariables } from './tnl-aliases.ts';

export function callExpression(
	callee: any,
	args: any[],
	TNL__currentFunctionScopeInvokedEventId: string,
) {
	if (typeof callee !== 'function') {
		// Call to immediately trigger the error from calling a non-function type
		callee(...args);
	}

	const overloadedCalleeFunctionId = overloadedFunctionReferenceToFunctionId
		.get(callee);
	const isOverloadedCalleeFunction = overloadedCalleeFunctionId !== undefined;

	let executionEventId: string;

	const _addCallEvent = () => {
		const currentFunctionScopeInvokedEvent = getEvent<'invoked'>(
			TNL__currentFunctionScopeInvokedEventId,
		);

		const callEvent = createEvent({
			eventId: nanoid(),
			functionScope: currentFunctionScopeInvokedEvent === undefined ?
				{
					name: callee.name,
				} :
				{
					functionId: currentFunctionScopeInvokedEvent.functionId,
				},
			type: 'call',
			callee: isOverloadedCalleeFunction ?
				{ functionId: overloadedCalleeFunctionId } :
				{ name: callee.name },
			returnValue: null,
		});

		if (currentFunctionScopeInvokedEvent !== undefined) {
			currentFunctionScopeInvokedEvent.executionEventsIds.push(
				callEvent.eventId,
			);
		}

		return callEvent;
	};

	if (jsxDEVFunctions.has(callee)) {
		const originalChild = args[0];
		const source = args[4];

		const renderEvent = createEvent({
			eventId: nanoid(),
			type: 'render',
			source,
			rendererFunction: isOverloadedCalleeFunction ?
				{ functionId: overloadedCalleeFunctionId } :
				{ name: callee.name },
			args: [originalChild.name],
		});

		sourceToRenderEventIdMap.set(JSON.stringify(source), renderEvent.eventId);

		const currentFunctionScopeInvokedEvent = getEvent<'invoked'>(
			TNL__currentFunctionScopeInvokedEventId,
		);

		if (currentFunctionScopeInvokedEvent !== undefined) {
			currentFunctionScopeInvokedEvent.executionEventsIds.push(
				renderEvent.eventId,
			);
		}

		executionEventId = renderEvent.eventId;
	} else {
		// TODO
		executionEventId = '';
	}

	// dprint-ignore
	const calledArgs = [
		...(
			isOverloadedCalleeFunction
				? [
					args.length === 0
						? {
							[tnlVariables.TNL__symbol]: Symbol.for('TNL__symbol'),
							[tnlVariables.TNL__callerExecutionEventId]: executionEventId
						}
						: {
							[tnlVariables.TNL__arg]: args[0],
							[tnlVariables.TNL__symbol]: Symbol.for('TNL__symbol'),
							[tnlVariables.TNL__callerExecutionEventId]: executionEventId
						}
				]
				: args.length === 0
					? []
					: [args[0]]
		),
		...args.slice(1)
	]

	const ret = callee(...calledArgs);

	// callEvent.returnValue = ret;

	return ret;
}
