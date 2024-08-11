import type { TransformationThis } from '#types';
import { getTransformedCodeFromAstNode } from '#utils/transform.ts';

export function AssignmentExpression(
	this: TransformationThis,
	node: any,
	state: any,
) {
	const { context, replacements } = this;
	const scopeName = node.left.name;
	replacements.push({
		start: node.right.start,
		end: node.right.end,
		value: getTransformedCodeFromAstNode(
			node.right,
			{ ...state, scopeName },
			null,
			context,
		),
	});
}
