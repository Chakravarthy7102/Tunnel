import { Locator } from '#classes/locator.ts';
import { isButton } from '#utils/button.ts';
import { getIdXPath, getXPath } from '#utils/xpath.ts';

export function getLocatorFromXPath(xpath: string): Locator {
	const locator = new Locator(document.createElement('div'));
	const regex = /\/\/(\w+)\[(@\w+='.+?'(?: and @\w+='.+?')*)]/;
	const match = xpath.match(regex);

	if (match) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- Guaranteed to exist
		const tag = match[1]!;
		locator.putMetadata('tag', tag);

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- Guaranteed to exist
		const conditionsStr = match[2]!;

		const conditionRegex = /@(\w+)='(.+?)'/g;
		let conditionMatch;
		while ((conditionMatch = conditionRegex.exec(conditionsStr)) !== null) {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- Guaranteed to exist
			const key = conditionMatch[1]!;
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- Guaranteed to exist
			const value = conditionMatch[2]!;
			locator.putMetadata(key, value);
		}
	}

	return locator;
}

export function getLocatorForElement(
	element: Element,
	document: Document,
): Locator {
	const locator = new Locator(element);

	locator.putMetadata('tag', element.tagName.toLowerCase());
	locator.putMetadata('class', element.getAttribute('class') ?? '');
	locator.putMetadata('name', element.getAttribute('name') ?? '');
	locator.putMetadata('id', element.id);
	locator.putMetadata('href', element.getAttribute('href') ?? '');
	locator.putMetadata('alt', element.getAttribute('alt') ?? '');
	locator.putMetadata('xpath', getXPath(element, document));
	locator.putMetadata('idxpath', getIdXPath(element, document));
	locator.putMetadata('is_button', isButton(element) ? 'yes' : 'no');

	// const rect = element.getBoundingClientRect();
	// locator.putMetadata('location', `${rect.left},${rect.top}`);
	// locator.putMetadata('area', (rect.width * rect.height).toString());
	// locator.putMetadata('shape', ((rect.width * 100) / rect.height).toString());

	locator.putMetadata('visible_text', element.textContent?.trim() ?? '');
	// locator.putMetadata('neighbor_text', getNeighborText(element));

	return locator;
}
