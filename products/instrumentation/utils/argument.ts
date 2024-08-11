export function getArgumentString({
	node,
	index,
}: {
	node: any;
	index: number;
}) {
	if (node.name) {
		return node.name;
	}

	if (node.argument) {
		return `...${(node.argument.name as string | undefined) ?? 'TNL__args'}`;
	}

	if (node.left) {
		return node.left.name ?? `TNL__arg${index}`;
	}

	return `TNL__arg${index}`;
}
