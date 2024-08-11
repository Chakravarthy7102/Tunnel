import { cloneCanvas } from './clone-canvas.ts';
import { cloneIframe } from './clone-iframe.ts';
import { cloneImage } from './clone-image.ts';
import { cloneVideo } from './clone-video.ts';
import type { Context } from './context.ts';
import {
	areRectanglesIntersecting,
	isCanvasElement,
	isIFrameElement,
	isImageElement,
	isVideoElement,
} from './utils.ts';

export function cloneElement<T extends HTMLElement | SVGElement>(
	node: T,
	context: Context,
): (HTMLElement | SVGElement) | Promise<HTMLElement | SVGElement> {
	if (isCanvasElement(node)) {
		return cloneCanvas(node);
	}

	if (isIFrameElement(node)) {
		return cloneIframe(node, context);
	}

	if (isImageElement(node)) {
		// Don't clone images that are outside the viewport
		if (context.crop === null) {
			return cloneImage(node);
		}

		if (areRectanglesIntersecting(context.crop, node.getBoundingClientRect())) {
			return cloneImage(node);
		}
	}

	if (isVideoElement(node)) {
		return cloneVideo(node);
	}

	return node.cloneNode(false) as T;
}
