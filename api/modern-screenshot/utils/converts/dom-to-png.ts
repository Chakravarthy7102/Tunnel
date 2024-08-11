import type { Context } from '#utils/context.ts';
import { orCreateContext } from '#utils/create-context.ts';
import type { Options } from '#utils/options.ts';
import { domToDataUrl } from './dom-to-data-url.ts';

export async function domToPng<T extends Node>(
	node: T,
	options?: Options,
): Promise<string>;
export async function domToPng<T extends Node>(
	context: Context<T>,
): Promise<string>;
export async function domToPng(node: any, options?: any) {
	return domToDataUrl(
		await orCreateContext(node, { ...options, type: 'image/png' }),
	);
}
