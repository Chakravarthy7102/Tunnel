import type {
	CommentNode,
	Node,
} from '../node_modules/parse5/dist/tree-adapters/default.js';

function isCdataSectionNode(node: Node) {
	return (
		node.nodeName === '#comment' &&
		(node as CommentNode).data.startsWith('CDATA')
	);
}

function isProcessingInstructionNode(node: Node) {
	return (
		node.nodeName === '#comment' &&
		(node as CommentNode).data.startsWith('?xml')
	);
}

export function xPathValue(node: Node): Step | null {
	let ownValue;

	const ownIndex = xPathIndex(node);
	if (ownIndex === -1) {
		return null;
	} // Error.

	if (node.nodeName === '#text' && isCdataSectionNode(node)) {
		ownValue = 'text()';
	} else if (isProcessingInstructionNode(node)) {
		ownValue = 'processing-instruction()';
	} else if (node.nodeName === '#comment') {
		ownValue = 'comment()';
	} else if (node.nodeName === '#document') {
		ownValue = '';
	} else {
		ownValue = !('namespaceURI' in node) ||
				// eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison -- TODO
				node.namespaceURI === 'http://www.w3.org/1999/xhtml' ?
			node.nodeName :
			`*[name()='${node.nodeName}']`;
	}

	if (ownIndex > 0) {
		ownValue += `[${ownIndex}]`;
	}

	return new Step(ownValue, node.nodeName === '#document');
}

/**
	Gets the XPath index of the node among its siblings (e.g. in case the parent node has multiple <div>'s)
*/
function xPathIndex(node: Node): number {
	// Returns -1 in case of error, 0 if no siblings matching the same expression,
	// <XPath index among the same expression-matching sibling nodes> otherwise.
	function areNodesSimilar(left: Node, right: Node) {
		if (
			left.sourceCodeLocation?.startOffset ===
				right.sourceCodeLocation?.startOffset
		) {
			return true;
		}

		if (!left.nodeName.startsWith('#') && !right.nodeName.startsWith('#')) {
			return left.nodeName === right.nodeName;
		}

		if (left.nodeName === right.nodeName) {
			return true;
		}

		// XPath treats CDATA as text nodes.
		const leftType = isCdataSectionNode(left) ? '#text' : left.nodeName;
		const rightType = isCdataSectionNode(right) ? '#text' : right.nodeName;

		return leftType === rightType;
	}

	const siblings = 'parentNode' in node && node.parentNode !== null ?
		node.parentNode.childNodes :
		null;

	if (!siblings) {
		return 0;
	} // Root node - no siblings.

	let hasSameNamedElements;
	for (const sibling of siblings) {
		if (areNodesSimilar(node, sibling) && sibling !== node) {
			hasSameNamedElements = true;
			break;
		}
	}

	if (!hasSameNamedElements) {
		return 0;
	}

	let ownIndex = 1; // XPath indices start with 1.
	for (const sibling of siblings) {
		if (areNodesSimilar(node, sibling)) {
			if (sibling === node) {
				return ownIndex;
			}

			++ownIndex;
		}
	}

	return -1; // An error occurred: |node| not found in parent's children.
}

class Step {
	value: string;
	optimized: boolean;
	constructor(value: string, optimized?: boolean) {
		this.value = value;
		this.optimized = optimized ?? false;
	}

	toString() {
		return this.value;
	}
}
