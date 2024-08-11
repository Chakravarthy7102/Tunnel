import { getInstrumentedCode } from './instrument.ts';

export function getEvalInstrumentedCode(code: string, filepath: string) {
	code = code.toString();

	// buggy
	return code;

	// For the MVP, we only want to instrument user code, so we check for a `sourceURL=...` comment
	const sourceUrls = code.matchAll(/\/\/#\s*sourceURL=(.*)/g);

	for (const sourceUrl of sourceUrls) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- Guaranteed to exist
		const filepath = sourceUrl[1]!;

		if (
			filepath.includes('/node_modules/') &&
			!filepath.includes('/next/dist/server') &&
			!filepath.includes('/package-augmentations/') &&
			!/\/react(-[^/]+)?(\/|$)/.test(filepath)
		) {
			return code;
		}
	}

	const instrumentedCode = getInstrumentedCode({
		code,
		filepath,
		sourceType: 'script',
		inEval: true,
		localProjectEnvironment: (globalThis as any).TNL__.localProjectEnvironment,
		tunnelYamlConfig: (globalThis as any).TNL__.tunnelYamlConfig,
	});

	return instrumentedCode;
}

export const originalEval = eval;

export function patchedEval(code: string) {
	try {
		// Force an indirect eval call
		return patchedEval(
			getInstrumentedCode({
				code,
				filepath: '<eval>',
				sourceType: 'script',
				inEval: true,
				localProjectEnvironment:
					(globalThis as any).TNL__.localProjectEnvironment ?? null,
				tunnelYamlConfig: (globalThis as any).TNL__.tunnelYamlConfig,
			}),
		);
	} catch {
		return originalEval(code);
	}
}
