import { maskHighEntropySubstrings } from '#utils/high-entropy-strings.ts';

export function maskSecretsInObject<T extends object>(
	object: T,
): T {
	const objectCache = new Set();
	// First, mask all high entropy strings
	const maskedData = Object.fromEntries(
		Object.entries(object).map(([key, value]) => {
			if (typeof value === 'string') {
				return [key, maskHighEntropySubstrings(value)];
			}

			if (typeof value === 'object') {
				if (value === null) {
					return [key, value];
				}

				if (objectCache.has(value)) {
					return [key, '[Circular]'];
				}

				objectCache.add(value);
				return [key, maskSecretsInObject(value)];
			}

			return [key, value];
		}),
	) as T;

	return maskedData;
	// Then, mask all sensitive properties
	// return maskData(maskedData, {
	// 	excludeMatchers: ['url', 'uuid', 'email', 'ipv4'],
	// });
}
