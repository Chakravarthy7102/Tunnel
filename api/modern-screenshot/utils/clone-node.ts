import * as Rematrix from 'rematrix';
import { cloneElement } from './clone-element.ts';
import type { Context } from './context.ts';
import { copyCssStyles } from './copy-css-styles.ts';
import { copyInputValue } from './copy-input-value.ts';
import { copyPseudoClass } from './copy-pseudo-class.ts';
import {
	isCommentNode,
	isElementNode,
	isHTMLElementNode,
	isScriptElement,
	isSlotElement,
	isStyleElement,
	isSVGElementNode,
	isTextNode,
	isVideoElement,
	splitFontFamily,
} from './utils.ts';

const excludeParentNodes = new Set([
	'symbol', // test/fixtures/svg.symbol.html
]);

async function appendChildNode<T extends Node>(
	context: Context,
	cloned: T,
	child: ChildNode,
): Promise<void> {
	if (
		isElementNode(child) && (isStyleElement(child) || isScriptElement(child))
	) return;

	if (context.filter && !context.filter(child)) return;

	if (
		excludeParentNodes.has(cloned.nodeName) ||
		excludeParentNodes.has(child.nodeName)
	) {
		context.currentParentNodeStyle = undefined;
	} else {
		context.currentParentNodeStyle = context.currentNodeStyle;
	}

	// eslint-disable-next-line unicorn/prefer-dom-node-append -- `append` doesn't exist on type `Node`
	cloned.appendChild(await cloneNode(child, context));
}

async function cloneChildNodes<T extends Node>(
	context: Context,
	node: T,
	cloned: T,
): Promise<void> {
	const firstChild = (
		isElementNode(node) ?
			node.shadowRoot?.firstChild :
			undefined
	) ?? node.firstChild;

	for (let child = firstChild; child; child = child.nextSibling) {
		if (isCommentNode(child)) continue;
		if (
			isElementNode(child) &&
			isSlotElement(child) &&
			typeof child.assignedNodes === 'function'
		) {
			const nodes = child.assignedNodes();
			for (const node of nodes) {
				await appendChildNode(context, cloned, node as ChildNode);
			}
		} else {
			await appendChildNode(context, cloned, child);
		}
	}
}

function applyCssStyleWithOptions(
	cloned: HTMLElement | SVGElement,
	context: Context,
) {
	const { backgroundColor, width, height, style: styles } = context;
	const clonedStyle = cloned.style;
	if (backgroundColor) {
		clonedStyle.setProperty('background-color', backgroundColor, 'important');
	}

	if (width) clonedStyle.setProperty('width', `${width}px`, 'important');
	if (height) clonedStyle.setProperty('height', `${height}px`, 'important');
	// eslint-disable-next-line guard-for-in -- fix
	if (styles) for (const name in styles) clonedStyle[name] = styles[name]!;
}

function applyScrollStyleToChildren(
	context: Context,
	cloned: HTMLElement | SVGElement,
	{ scrollTop, scrollLeft }: { scrollTop: number; scrollLeft: number },
) {
	const { ownerWindow } = context;
	if (ownerWindow !== undefined && (scrollTop !== 0 || scrollLeft !== 0)) {
		const clonedStyle = cloned.style;
		clonedStyle.setProperty('overflow', 'hidden');

		for (const child of cloned.childNodes) {
			if (
				isElementNode(child) &&
				(isHTMLElementNode(child) || isSVGElementNode(child))
			) {
				const childComputedStyle = ownerWindow.getComputedStyle(child);
				if (
					// Need to use `child.style` here, for some reason `childComputedStyle.position` always returns an empty string
					child.style.position === 'fixed' ||
					child.style.position === 'sticky'
				) continue;

				child.style.transform = Rematrix.toString(Rematrix.multiply(
					Rematrix.fromString(childComputedStyle.transform),
					Rematrix.translate(-scrollLeft, -scrollTop),
				));
			}
		}
	}
}

/** @example "'{ */
const NORMAL_ATTRIBUTE_RE = /^[\w-:]+$/;

export async function cloneNode<T extends Node>(
	node: T,
	context: Context,
	isRoot = false,
): Promise<Node> {
	const { ownerDocument, ownerWindow, fontFamilies } = context;

	if (ownerDocument && isTextNode(node)) {
		return ownerDocument.createTextNode(node.data);
	}

	if (
		ownerDocument &&
		ownerWindow &&
		isElementNode(node) &&
		(isHTMLElementNode(node) || isSVGElementNode(node))
	) {
		const cloned = await cloneElement(node, context);

		if (context.isEnable('removeAbnormalAttributes')) {
			const names = cloned.getAttributeNames();
			for (let len = names.length, i = 0; i < len; i++) {
				const name = names[i]!;
				if (!NORMAL_ATTRIBUTE_RE.test(name)) {
					cloned.removeAttribute(name);
				}
			}
		}

		context.currentNodeStyle = copyCssStyles(
			node,
			cloned,
			isRoot,
			context,
		);
		const style = context.currentNodeStyle;

		if (isRoot) applyCssStyleWithOptions(cloned, context);

		let copyScrollbar = false;
		if (context.isEnable('copyScrollbar')) {
			const overflow = new Set([
				style.get('overflow-x')?.[0],
				style.get('overflow-y')?.[1],
			]);
			copyScrollbar = (overflow.has('scroll')) ||
				(
					(overflow.has('auto') || overflow.has('overlay')) &&
					(node.scrollHeight > node.clientHeight ||
						node.scrollWidth > node.clientWidth)
				);
		}

		copyPseudoClass(node, cloned, copyScrollbar, context);

		copyInputValue(node, cloned);

		splitFontFamily(style.get('font-family')?.[0])
			// eslint-disable-next-line unicorn/no-array-for-each -- todo
			?.forEach((val) => fontFamilies.add(val));

		if (!isVideoElement(node)) {
			await cloneChildNodes(context, node, cloned);
			applyScrollStyleToChildren(
				context,
				cloned,
				{
					scrollTop: node.scrollTop,
					scrollLeft: node.scrollLeft,
				},
			);
		}

		return cloned;
	}

	const cloned = node.cloneNode(false);

	await cloneChildNodes(context, node, cloned);

	return cloned;
}
