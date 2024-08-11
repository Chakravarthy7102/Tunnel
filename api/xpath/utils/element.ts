import { getLocatorForElement, getLocatorFromXPath } from '#utils/locator.ts';
import { calcSimilarityScore } from '#utils/similarity.ts';

export function getElementBySimiloXpath(
	xpath: string,
	document: Document,
): HTMLElement | null {
	try {
		if (xpath === '') {
			return null;
		}

		// Check if the XPath is a Similo XPath or a normal XPath
		const isSimiloXPath = xpath.startsWith('//') && xpath.includes('[@');

		if (isSimiloXPath) {
			// Similo XPath
			const targetLocator = getLocatorFromXPath(xpath);

			const candidateElements = document.getElementsByTagName(
				targetLocator.getMetadata('tag') ?? '*',
			) as HTMLCollectionOf<HTMLElement>;

			let bestSimilarityScore = 0;
			let bestCandidateElement: HTMLElement | null = null;

			for (const candidateElement of candidateElements) {
				const candidateLocator = getLocatorForElement(
					candidateElement,
					document,
				);
				const similarityScore = calcSimilarityScore(
					targetLocator,
					candidateLocator,
				);

				if (similarityScore > bestSimilarityScore) {
					bestSimilarityScore = similarityScore;
					bestCandidateElement = candidateElement;
				}
			}

			return bestCandidateElement;
		} else {
			// Normal XPath
			const result = document.evaluate(
				xpath,
				document,
				null,
				XPathResult.FIRST_ORDERED_NODE_TYPE,
				null,
			);
			return result.singleNodeValue as HTMLElement | null;
		}
	} catch {
		return null;
	}
}
