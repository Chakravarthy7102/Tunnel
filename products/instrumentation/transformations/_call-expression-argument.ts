import type { TransformationThis } from '#types';
import { getTransformedCodeFromAstNode } from '#utils/transform.ts';

export function _CallExpressionArgument(
	this: TransformationThis,
	node: any,
	state: any,
) {
	const { context, replacements } = this;
	if (node.type === 'SequenceExpression') {
		// We need to wrap this code in parentheses for sequence expression arguments (since the AST location doesn't include the grouping parentheses as part of the sequence expression)
		replacements.push({
			start: node.start,
			end: node.end,
			value: '(' + getTransformedCodeFromAstNode(node, state, null, context) +
				')',
		});
	} else {
		replacements.push({
			start: node.start,
			end: node.end,
			value: getTransformedCodeFromAstNode(node, state, null, context),
		});
	}
}
