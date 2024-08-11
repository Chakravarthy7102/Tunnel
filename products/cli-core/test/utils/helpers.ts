/**
	All ASCII codes from 0 - 127
*/
export const _asciiCodes = [...Array.from({ length: 128 }).keys()];

export const _join = (strings: (string | string[] | string[][] | null)[]) =>
	strings
		.filter((str) => str !== null)
		.flat()
		.join('');

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- guarantee
export const _int = (str: string) => str.codePointAt(0)!;
export const _chr = (code: number) => String.fromCodePoint(code);
