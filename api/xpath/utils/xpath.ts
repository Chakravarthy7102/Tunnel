import type { Locator } from '#classes/locator.ts';
import { LOCATORS } from '#constants/similo.ts';
import { getLocatorForElement } from '#utils/locator.ts';
import { logger } from '@-/logger';

export function getSimiloXpathForElement(
	targetElement: Element,
	document: Document,
): string {
	try {
		const targetLocator = getLocatorForElement(targetElement, document);
		const result = similoXPath(targetLocator);
		return result;
	} catch (error) {
		logger.error(
			'Failed to calculate Similo XPath; falling back to absolute XPath instead:',
			error,
		);
		return getXPath(targetElement, document);
	}
}

/**
	@nothrow
*/
export function getXPath(element: Element, document: Document): string {
	if (element.id !== '') {
		return `//*[@id="${element.id}"]`;
	}

	if (element === document.body) {
		return '/html/body';
	}

	let ix = 0;
	const siblings = element.parentNode?.childNodes ?? [];
	for (const sibling of siblings) {
		if (sibling === element) {
			return `${
				getXPath(element.parentNode as Element, document)
			}/${element.tagName.toLowerCase()}[${ix + 1}]`;
		}

		if (
			sibling.nodeType === 1 && (sibling as Element).tagName === element.tagName
		) {
			ix++;
		}
	}

	// We don't want to return an empty string here because that isn't a valid XPath
	return '/';
}

export function getIdXPath(element: Element, document: Document): string {
	let path = '';
	while (element !== document.documentElement) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- Guaranteed to exist
		const idx = [...element.parentNode!.children].indexOf(element);
		path = `/*[${idx + 1}]${path}`;
		element = element.parentNode as Element;
	}

	return `/html${path}`;
}

export function similoXPath(
	targetLocator: Locator,
): string {
	const conditions = LOCATORS.map((locatorName) => {
		const value = targetLocator.getMetadata(locatorName);
		if (value) {
			return `@${locatorName}='${value}'`;
		}

		return '';
	}).filter((condition) => condition !== '');

	const tag = targetLocator.getMetadata('tag') ?? '*';
	return `//${tag}[${conditions.join(' and ')}]`;
}
