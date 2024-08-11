import type { TransformationThis } from '#types';

export function MethodDefinition(this: TransformationThis, node: any) {
	if (node.kind === 'constructor') {
		return undefined;
	}

	// TODO: we don't handle the `super` keyword well yet
	// replacements.push({
	// 	start: node.value.start,
	// 	end: node.value.end,
	// 	value: TNL__[tnlProperties.getTransformedCodeFromAstNode](
	// 		node.value,
	// 		state,
	// 		null,
	// 		context
	// 	)
	// })
}
