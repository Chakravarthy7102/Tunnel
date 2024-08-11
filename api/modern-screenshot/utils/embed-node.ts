import type { Context } from './context.ts';
import { embedCssStyleImage } from './embed-css-style-image.ts';
import { embedImageElement } from './embed-image-element.ts';
import { embedSvgUse } from './embed-svg-use.ts';
import {
	isElementNode,
	isHTMLElementNode,
	isImageElement,
	isSVGImageElementNode,
	isSVGUseElementNode,
} from './utils.ts';

export function embedNode<T extends Node>(cloned: T, context: Context) {
	const { tasks } = context;

	if (isElementNode(cloned)) {
		if (isImageElement(cloned) || isSVGImageElementNode(cloned)) {
			tasks.push(...embedImageElement(cloned, context));
		}

		if (isSVGUseElementNode(cloned)) {
			tasks.push(...embedSvgUse(cloned, context));
		}
	}

	if (isHTMLElementNode(cloned)) {
		tasks.push(...embedCssStyleImage(cloned.style, context));
	}

	for (const child of cloned.childNodes) {
		embedNode(child, context);
	}
}
