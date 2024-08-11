export function getParameterPatternWithRight({
	code,
	node,
}: {
	code: string;
	node: any;
}) {
	return code.slice(node.start, node.end);
}

export function getNamedParameterPatternWithRight({
	code,
	node,
	index,
}: {
	code: string;
	node: any;
	index: number;
}): string {
	if (node.name) {
		return code.slice(node.start, node.end);
	}

	if (node.argument) {
		// A rest parameter cannot have a right
		return getNamedParameterPatternWithoutRight({
			code,
			node,
			index,
		});
	}

	if (node.left) {
		if (node.left.name) {
			return code.slice(node.start, node.end);
		}

		return `${
			getNamedParameterPatternWithoutRight({
				code,
				node,
				index,
			})
		} = ${code.slice(node.right.start, node.right.end)}`;
	}

	if (node.right) {
		return `${
			getNamedParameterPatternWithoutRight({
				code,
				node,
				index,
			})
		} = ${code.slice(node.right.start, node.right.end)}`;
	}

	return getNamedParameterPatternWithoutRight({
		code,
		node,
		index,
	});
}

/**
	A named parameter pattern is the pattern that appears in the function's declaration. For non-named parameters, it defaults to `TNL__arg${index}`, and it includes the triple dots for rest parameters.
*/
export function getNamedParameterPatternWithoutRight({
	node,
	index,
}: {
	code: string;
	node: any;
	index: number;
}): string {
	if (node === undefined) {
		return `TNL__arg${index}`;
	}

	if (node.name) {
		return node.name;
	}

	if (node.argument) {
		return `...${(node.argument.name as string | undefined) ?? 'TNL__args'}`;
	}

	if (node.left?.name) {
		return node.left.name;
	}

	return `TNL__arg${index}`;
}

/**
	Returns how the parameter would appear in the function declaration's parameters without the right.
*/
export function getParameterPatternWithoutRight({
	code,
	node,
}: {
	code: string;
	node: any;
}): string {
	if (node.name) {
		return node.name;
	}

	if (node.argument) {
		return `...${code.slice(node.argument.start, node.argument.end)}`;
	}

	if (node.left) {
		return code.slice(node.left.start, node.left.end);
	}

	return code.slice(node.start, node.end);
}

/**
	Gets the identifier that refers to the function's first parameter.
*/
export function getFirstParameterIdentifier({
	node,
	inArrowFunction,
}: {
	node: any;
	inArrowFunction: boolean;
}): string {
	// If the param node is undefined, we assume that the function has no parameters (and thus will have a default rest parameter added)
	if (node === undefined) {
		return inArrowFunction ? 'TNL__args[0]' : 'arguments[0]';
	}

	// If the param node is a rest parameter
	if (node.argument) {
		return `${(node.argument.name as string | undefined) ?? 'TNL__args'}[0]`;
	}

	if (node.name) {
		return node.name;
	}

	if (node.left?.name) {
		return node.left.name;
	}

	// If the first parameter does not have an explicit name, it will be given the name `TNL__arg0`
	return inArrowFunction ? 'TNL__arg0' : 'arguments[0]';
}

export function getParameterRight({
	code,
	node,
}: {
	code: string;
	node: any;
}): string | null {
	if (node === undefined) {
		return null;
	}

	if (node.right) {
		return code.slice(node.right.start, node.right.end);
	}

	if (node.argument) {
		return null;
	}

	return null;
}
