import type { Locator } from '#classes/locator.ts';
import { LOCATORS, SIMILARITY_FUNCTION, WEIGHTS } from '#constants/similo.ts';
import leven from 'leven';

export function calcSimilarityScore(
	targetLocator: Locator,
	candidateLocator: Locator,
): number {
	let similarityScore = 0;
	for (const [i, locator] of LOCATORS.entries()) {
		const weight = WEIGHTS[i] ?? 0;
		const similarityFunction = SIMILARITY_FUNCTION[i] ?? 0;

		const targetValue = targetLocator.getMetadata(locator);
		const candidateValue = candidateLocator.getMetadata(locator);

		let similarity = 0;
		if (targetValue && candidateValue) {
			switch (similarityFunction) {
				case 1: {
					similarity = stringSimilarity(targetValue, candidateValue, 100) / 100;
					break;
				}

				default: {
					similarity = equalSimilarity(targetValue, candidateValue, 1);
				}
			}
		}

		similarityScore += similarity * weight;
	}

	return similarityScore;
}

export function equalSimilarity(
	value1: string,
	value2: string,
	maxScore: number,
): number {
	return value1 === value2 ? maxScore : 0;
}

function stringSimilarity(
	str1: string,
	str2: string,
	maxScore: number,
): number {
	if (str1.length === 0 || str2.length === 0) {
		return 0;
	}

	if (str1 === str2) {
		return maxScore;
	}

	const longer = str1.length > str2.length ? str1 : str2;
	const shorter = str1.length > str2.length ? str2 : str1;

	const distance = leven(longer, shorter);
	return ((longer.length - distance) * maxScore) / longer.length;
}
