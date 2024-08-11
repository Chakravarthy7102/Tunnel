import type { Replacement } from '#types';
import type * as acorn from 'acorn';

export function getReplacedCodeFromReplacements({
	ast,
	originalCode,
	replacements,
}: {
	ast: acorn.Node;
	originalCode: string;
	replacements: Replacement[];
}): string {
	const newCodeParts = [];
	let previousEnd = ast.start;
	for (const replacement of replacements.sort((a, b) => a.start - b.start)) {
		newCodeParts.push(
			originalCode.slice(previousEnd, replacement.start),
			replacement.value,
		);
		previousEnd = replacement.end;
	}

	newCodeParts.push(originalCode.slice(previousEnd, ast.end));

	const newCodeContents = newCodeParts.join('');

	return newCodeContents;
}
