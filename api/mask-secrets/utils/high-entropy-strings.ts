/**
	@file This code is based on https://github.com/mazen160/detect_passive_secrets/blob/master/detect_passive_secrets.js
*/

const BASE64_CHARACTERS = new Set(
	'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
);
const HEX_CHARACTERS = new Set('1234567890abcdefABCDEF');

const DEFAULT_HEX_ENTROPY = 3.5;
const DEFAULT_BASE64_ENTROPY = 4.05;

/*
	Creates an array of character frequencies.
*/
function getFrequencies(string: string) {
	const dictionary = new Set(string);
	const badCharacters = new Set(['', '+', '*', '[', ']', '{', '}']);
	return [...dictionary].map((character) => {
		if (badCharacters.has(character)) {
			return 0;
		}

		return string.match(new RegExp(character, 'g'))?.length ?? 0;
	});
}

// Measure the entropy of a string in bits per symbol.
export function getShannonEntropy(string: string) {
	return getFrequencies(string)
		// eslint-disable-next-line unicorn/no-array-reduce -- Sum
		.reduce((sum, frequency) => {
			const p = frequency / string.length;
			return sum - (p * Math.log(p) / Math.log(2));
		}, 0);
}

// Measure the entropy of a string in total bits.
const _getShannonEntropyBits = (string: string) =>
	getShannonEntropy(string) * string.length;

function getStringsOfSet(
	word: string,
	characterSet: Set<string>,
	threshold = 20,
) {
	let count = 0;
	let letters = '';
	const strings = [];
	for (const character of word) {
		if (characterSet.has(character)) {
			letters += character;
			count += 1;
			if (count > threshold) {
				strings.push(letters);
				letters = '';
				count = 0;
			}
		}
	}

	if (letters.length > 0) {
		strings.push(letters);
		letters = '';
	}

	return strings;
}

function getTokenizedStrings(text: string) {
	const strings = new Set<string>();
	const lines = text.split('\n');
	for (const line of lines) {
		for (const word of line.split(' ')) {
			strings.add(word);
		}
	}

	return strings;
}

export function scanText(
	text: string,
	stringLengthThreshold = 20,
	allowedBase64Entropy = DEFAULT_BASE64_ENTROPY,
	allowedHexEntropy = DEFAULT_HEX_ENTROPY,
) {
	const stringsFound = new Set<string>();
	const tokenizedStrings = getTokenizedStrings(text);
	for (const word of tokenizedStrings) {
		const base64Strings = getStringsOfSet(
			word,
			BASE64_CHARACTERS,
			stringLengthThreshold,
		);
		for (const base64String of base64Strings) {
			const base64Entropy = getShannonEntropy(base64String);
			if (base64Entropy > allowedBase64Entropy) {
				stringsFound.add(word);
			}
		}

		const hexStrings = getStringsOfSet(
			word,
			HEX_CHARACTERS,
			stringLengthThreshold,
		);
		for (const hexString of hexStrings) {
			const hexEntropy = getShannonEntropy(hexString);
			if (hexEntropy > allowedHexEntropy) {
				stringsFound.add(word);
			}
		}
	}

	return stringsFound;
}

export function maskHighEntropySubstrings(text: string) {
	const secrets = scanText(text);
	let maskedText = text;
	for (const secret of secrets) {
		maskedText = maskedText.replaceAll(
			secret,
			secret.slice(0, 2) + '*'.repeat(secret.length - 2) + secret.slice(-2),
		);
	}

	return maskedText;
}
