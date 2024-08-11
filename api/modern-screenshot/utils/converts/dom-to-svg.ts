import type { Context } from '#utils/context.ts';
import { orCreateContext } from '#utils/create-context.ts';
import type { Options } from '#utils/options.ts';
import { createSvg, svgToDataUrl } from '#utils/utils.ts';
import { domToDataUrl } from './dom-to-data-url.ts';

export async function domToSvg<T extends Node>(
	node: T,
	options?: Options,
): Promise<string>;
export async function domToSvg<T extends Node>(
	context: Context<T>,
): Promise<string>;
export async function domToSvg(node: any, options?: any) {
	const context = await orCreateContext(node, options);
	const { width, height, crop, ownerDocument } = context;
	const dataUrl = await domToDataUrl(context);
	const svg = createSvg({ width, height, crop, ownerDocument });
	const svgImage = svg.ownerDocument.createElementNS(svg.namespaceURI, 'image');
	svgImage.setAttributeNS(null, 'href', dataUrl);
	svgImage.setAttributeNS(null, 'height', '100%');
	svgImage.setAttributeNS(null, 'width', '100%');
	svg.append(svgImage);
	return svgToDataUrl(svg, context.isEnable('removeControlCharacter'));
}
