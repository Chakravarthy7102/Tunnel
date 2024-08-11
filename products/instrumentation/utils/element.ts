import type { FunctionEventId } from '#types';
import { createTnlProperty } from './property.ts';
import { tnlProperties } from './tnl-aliases.ts';

/**
	browser-only
*/
export const elementDomNodeToEventId = createTnlProperty(
	tnlProperties.elementDomNodeToEventId,
	() => new Map<Node, FunctionEventId>(),
);

export function setElementDomNodeEventIdFromXpath(
	elementXpath: string,
	eventId: FunctionEventId,
) {
	const elementDomNode = document
		.evaluate(elementXpath, document, null, XPathResult.ANY_TYPE, null)
		.iterateNext();

	if (elementDomNode !== null) {
		elementDomNodeToEventId.set(elementDomNode, eventId);
	}
}
