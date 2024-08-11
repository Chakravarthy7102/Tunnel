import type { Context } from '#utils/context.ts';
import { orCreateContext } from '#utils/create-context.ts';
import type { Options } from '#utils/options.ts';
import { domToCanvas } from './dom-to-canvas.ts';

export async function domToPixel<T extends Node>(
	node: T,
	options?: Options,
): Promise<Uint8ClampedArray>;
export async function domToPixel<T extends Node>(
	context: Context<T>,
): Promise<Uint8ClampedArray>;
export async function domToPixel(node: any, options?: any) {
	const context = await orCreateContext(node, options);
	const canvas = await domToCanvas(context);
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- Guaranteed to exist
	return canvas.getContext('2d')!
		.getImageData(0, 0, canvas.width, canvas.height)
		.data;
}
