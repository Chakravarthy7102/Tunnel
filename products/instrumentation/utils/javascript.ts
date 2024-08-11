export function js(strings: TemplateStringsArray, ...values: any[]): string {
	const result: string[] = [];
	for (let i = 0; i < strings.length - 1; i++) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- Guaranteed to exist
		const trimmedString = strings[i]!.replaceAll(/\s/g, '');
		result.push(trimmedString, values[i]);
	}

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- Guaranteed to exist
	result.push(strings.at(-1)!.replaceAll(/\s/g, ''));
	return result.join('');
}
