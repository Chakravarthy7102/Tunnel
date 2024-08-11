export function getNewCodeFromReplacements({
	originalCode,
	replacements,
}: {
	originalCode: string;
	replacements: { start: number; end: number; replacement: string }[];
}) {
	if (replacements.length === 0) {
		return originalCode;
	}

	replacements.sort((r1, r2) => r1.start - r2.start);

	const newCodeParts: string[] = [];
	let previousEnd = 0;
	for (const replacement of replacements) {
		newCodeParts.push(
			originalCode.slice(previousEnd, replacement.start),
			replacement.replacement,
		);
		previousEnd = replacement.end;
	}

	newCodeParts.push(originalCode.slice(previousEnd));

	return newCodeParts.join('');
}
