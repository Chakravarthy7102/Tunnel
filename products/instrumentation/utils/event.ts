import type {
	FunctionEvent,
	FunctionEventId,
	FunctionEventType,
} from '#types';
import { nanoid } from 'nanoid/non-secure';
import { createTnlProperty } from './property.ts';
import { tnlProperties } from './tnl-aliases.ts';

/**
	A object containing mappings from event IDs to events.

	This object is only used in the browser. In Node.js, we store these mappings on the file system to reduce memory overhead.
*/
export const functionEventsMap: Map<FunctionEventId | string, FunctionEvent> =
	createTnlProperty(
		tnlProperties.functionEventsMap,
		() => new Map(),
	);

export function createEvent<$FunctionEventType extends FunctionEventType>(
	event: Omit<FunctionEvent<$FunctionEventType>, 'eventId'> & {
		eventId: string;
	},
): FunctionEvent<$FunctionEventType> {
	functionEventsMap.set(event.eventId, event as any);
	return event as any;
}

export function getEvent<
	$FunctionEventType extends FunctionEventType = FunctionEventType,
>(
	eventId: FunctionEventId | string,
): FunctionEvent<$FunctionEventType> | undefined {
	return functionEventsMap.get(eventId) as
		| FunctionEvent<$FunctionEventType>
		| undefined;
}

export function createGlobalInvokedEvent(functionId: string) {
	return createEvent({
		eventId: nanoid(),
		type: 'invoked',
		functionLocation: null,
		// functionLocation: getCurrentLocation({
		// 	check: (loc) => !loc.file.includes('instrumentation'),
		// 	immediate: true
		// }),
		functionId,
		callerExecutionEventId: null,
		args: [],
		executionEventsIds: [],
	});
}
