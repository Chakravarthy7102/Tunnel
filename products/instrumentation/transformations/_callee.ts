import type { TransformationThis } from '#types';
import { js } from '#utils/javascript.ts';
import { tnlProperties } from '#utils/tnl-aliases.ts';
import { getTransformedCodeFromAstNode } from '#utils/transform.ts';

export function _Callee(this: TransformationThis, node: any, state: any) {
	const { context, replacements } = this;

	if (node.type === 'MemberExpression') {
		const instrumentedObject = getTransformedCodeFromAstNode(
			node.object,
			state,
			null,
			context,
		);

		let instrumentedProperty = getTransformedCodeFromAstNode(
			node.property,
			state,
			null,
			context,
		);

		if (!node.computed) {
			instrumentedProperty = JSON.stringify(instrumentedProperty);
		}

		replacements.push({
			start: node.start,
			end: node.end,
			value: ' ' +
				js`
					TNL__.${tnlProperties.propertyCallee}(
						(${instrumentedObject}),
						(${instrumentedProperty})
					)
				`,
		});
	} else {
		const instrumentedCallee = getTransformedCodeFromAstNode(
			node,
			state,
			null,
			context,
		);
		replacements.push({
			start: node.start,
			end: node.end,
			value: ' ' +
				js`
					TNL__.${tnlProperties.exprCallee}(
						(${instrumentedCallee})
					)
				`,
		});
	}
}
