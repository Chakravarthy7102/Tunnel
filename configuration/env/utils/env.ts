import environmentVariables from '#data/variables.ts';

export function env(
	name: keyof typeof environmentVariables,
): string {
	const value = environmentVariables[name]();

	if (value === undefined) {
		throw new Error(
			`Environment variable \`${name}\` was not set`,
		);
	}

	// For some reason, the Infisical Vercel integration JSON-stringifies multi-line variables
	if (value.startsWith('"') && value.endsWith('"')) {
		// eslint-disable-next-line no-restricted-properties -- Guaranteed to be valid JSON
		return JSON.parse(value) as string;
	} else {
		// Replaces all '\\\\n' literals with '\n' and all '\\n' literals with an actual newline
		return value
			.replaceAll(String.raw`\n`, '\n')
			.replaceAll('\\\n', '\\n');
	}
}
