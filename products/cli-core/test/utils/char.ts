import fc from 'fast-check';
import { _asciiCodes, _chr } from './helpers.ts';

export const DIGIT = () =>
	fc.constantFrom(
		..._asciiCodes.filter((code) => code >= 0x30 && code <= 0x39).map(_chr),
	);
export const ALPHA = () =>
	fc.constantFrom(
		..._asciiCodes
			.filter(
				(code) =>
					(code >= 0x41 && code <= 0x5a) || (code >= 0x61 && code <= 0x7a),
			)
			.map(_chr),
	);
export const HEXDIG = () => fc.hexa();
export const SP = () => fc.constant('\u0020');
export const HTAB = () => fc.constant('\u0009');
export const CRLF = () => fc.constant('\u000D\u000A');
export const DQUOTE = () => fc.constant('\u0022');

/**
	any visible US-ASCII character
*/
export const VCHAR = () =>
	fc.constantFrom(
		..._asciiCodes.filter((code) => code >= 0x21 && code <= 0x7e).map(_chr),
	);

/**
	Any 8-bit sequence of data
*/
export const OCTET = () => fc.integer({ min: 0, max: 255 }).map(_chr);
