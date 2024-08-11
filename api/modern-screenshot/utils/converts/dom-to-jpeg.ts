import type { Context } from '#utils/context.ts';
import { orCreateContext } from '#utils/create-context.ts';
import type { Options } from '#utils/options.ts';
import { domToDataUrl } from './dom-to-data-url.ts';

export async function domToJpeg<T extends Node>(
	node: T,
	options?: Options,
): Promise<string>;
export async function domToJpeg<T extends Node>(
	context: Context<T>,
): Promise<string>;
export async function domToJpeg(node: any, options?: any): Promise<string> {
	return domToDataUrl(
		await orCreateContext(node, { ...options, type: 'image/jpeg' }),
	);
}
