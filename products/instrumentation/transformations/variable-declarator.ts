import type { TransformationThis } from '#types';
import { getTransformedCodeFromAstNode } from '#utils/transform.ts';

export function VariableDeclarator(
	this: TransformationThis,
	node: any,
	state: any,
) {
	const { context, replacements } = this;

	const scopeName = node.id.name;

	if (node.init !== null) {
		replacements.push({
			start: node.init.start,
			end: node.init.end,
			value: getTransformedCodeFromAstNode(
				node.init,
				{ ...state, scopeName },
				null,
				context,
			),
		});
	}
}
