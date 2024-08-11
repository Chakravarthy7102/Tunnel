import type { Context } from './context.ts';
import { consoleWarn, isSVGElementNode, uuid, XMLNS } from './utils.ts';

const ignoredStyles = new Set([
	'width',
	'height',
	'-webkit-text-fill-color',
]);

const includedAttributes = [
	'stroke',
	'fill',
];

export function getDefaultStyle(
	node: HTMLElement | SVGElement,
	pseudoElement: string | null,
	context: Context,
): Map<string, any> {
	const { defaultComputedStyles, ownerDocument } = context;

	const nodeName = node.nodeName.toLowerCase();
	const isSvgNode = isSVGElementNode(node) && nodeName !== 'svg';
	const attributes = isSvgNode ?
		includedAttributes
			.map((name) => [name, node.getAttribute(name)])
			.filter(([, value]) => value !== null) :
		[];

	const key = [
		isSvgNode && 'svg',
		nodeName,
		attributes.map((name, value) => `${name.toString()}=${value}`).join(','),
		pseudoElement,
	]
		.filter(Boolean)
		.join(':');

	if (defaultComputedStyles.has(key)) return defaultComputedStyles.get(key)!;

	let { sandbox } = context;
	if (!sandbox) {
		try {
			if (ownerDocument) {
				sandbox = ownerDocument.createElement('iframe');
				sandbox.id = `__SANDBOX__-${uuid()}`;
				sandbox.width = '0';
				sandbox.height = '0';
				sandbox.style.visibility = 'hidden';
				sandbox.style.position = 'fixed';
				ownerDocument.body.append(sandbox);
				sandbox.contentWindow?.document.write(
					'<!DOCTYPE html><meta charset="UTF-8"><title></title><body>',
				);
				context.sandbox = sandbox;
			}
		} catch (error) {
			consoleWarn('Failed to create iframe sandbox', error);
		}
	}

	if (!sandbox) return new Map();

	const sandboxWindow = sandbox.contentWindow;
	if (!sandboxWindow) return new Map();
	const sandboxDocument = sandboxWindow.document;

	let root: HTMLElement | SVGSVGElement;
	let el: Element;
	if (isSvgNode) {
		root = sandboxDocument.createElementNS(XMLNS, 'svg');
		el = root.ownerDocument.createElementNS(root.namespaceURI, nodeName);
		for (const [name, value] of attributes) {
			el.setAttributeNS(null, name!, value!);
		}

		root.append(el);
	} else {
		root = sandboxDocument.createElement(nodeName);
		el = root;
	}

	el.textContent = ' ';
	sandboxDocument.body.append(root);
	const computedStyle = sandboxWindow.getComputedStyle(el, pseudoElement);
	const styles = new Map<string, any>();
	for (let len = computedStyle.length, i = 0; i < len; i++) {
		const name = computedStyle.item(i);
		if (ignoredStyles.has(name)) continue;
		styles.set(name, computedStyle.getPropertyValue(name));
	}

	root.remove();

	defaultComputedStyles.set(key, styles);

	return styles;
}
