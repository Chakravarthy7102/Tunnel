import type { Context } from '#utils/context.ts';
import { orCreateContext } from '#utils/create-context.ts';
import type { Options } from '#utils/options.ts';
import { createImage } from '#utils/utils.ts';
import { domToDataUrl } from './dom-to-data-url.ts';
import { domToSvg } from './dom-to-svg.ts';

export async function domToImage<T extends Node>(
	node: T,
	options?: Options,
): Promise<HTMLImageElement>;
export async function domToImage<T extends Node>(
	context: Context<T>,
): Promise<HTMLImageElement>;
export async function domToImage(node: any, options?: any) {
	const context = await orCreateContext(node, options);
	const { ownerDocument, width, height, scale, type } = context;
	const url = type === 'image/svg+xml' ?
		await domToSvg(context) :
		await domToDataUrl(context);
	const image = createImage(url, ownerDocument);
	image.width = Math.floor(width * scale);
	image.height = Math.floor(height * scale);
	image.style.width = `${width}px`;
	image.style.height = `${height}px`;
	return image;
}
