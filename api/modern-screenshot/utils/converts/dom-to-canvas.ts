import { createStyleElement, orCreateContext } from '#utils/create-context.ts';
import { imageToCanvas } from '#utils/image-to-canvas.ts';
import { createImage, svgToDataUrl, XMLNS } from '#utils/utils.ts';
import { domToForeignObjectSvg } from './dom-to-foreign-object-svg.ts';

import type { Context } from '#utils/context.ts';
import type { Options } from '#utils/options.ts';

export async function domToCanvas<T extends Node>(
	node: T,
	options?: Options,
): Promise<HTMLCanvasElement>;
export async function domToCanvas<T extends Node>(
	context: Context<T>,
): Promise<HTMLCanvasElement>;
export async function domToCanvas(node: any, options?: any) {
	const context = await orCreateContext(node, options);
	const svg = await domToForeignObjectSvg(context);
	const dataUrl = svgToDataUrl(svg, context.isEnable('removeControlCharacter'));
	if (!context.autoDestruct) {
		context.svgStyleElement = createStyleElement(context.ownerDocument);
		context.svgDefsElement = context.ownerDocument?.createElementNS(
			XMLNS,
			'defs',
		);
		context.svgStyles.clear();
	}

	const image = createImage(dataUrl, svg.ownerDocument);
	return imageToCanvas(image, context);
}
