import { changeJpegDpi } from '#utils/change-jpeg-dpi.ts';
import { changePngDpi } from '#utils/change-png-dpi.ts';
import type { Context } from '#utils/context.ts';
import { orCreateContext } from '#utils/create-context.ts';
import type { Options } from '#utils/options.ts';
import { blobToArrayBuffer, canvasToBlob } from '#utils/utils.ts';
import { domToCanvas } from './dom-to-canvas.ts';

export async function domToBlob<T extends Node>(
	node: T,
	options?: Options,
): Promise<Blob>;
export async function domToBlob<T extends Node>(
	context: Context<T>,
): Promise<Blob>;
export async function domToBlob(node: any, options?: any) {
	const context = await orCreateContext(node, options);
	const { log, type, quality, dpi } = context;
	const canvas = await domToCanvas(context);
	log.time('canvas to blob');
	const blob = await canvasToBlob(canvas, type, quality);
	if (['image/png', 'image/jpeg'].includes(type) && dpi) {
		const arrayBuffer = await blobToArrayBuffer(blob.slice(0, 33));
		let uint8Array = new Uint8Array(arrayBuffer);
		if (type === 'image/png') {
			uint8Array = changePngDpi(uint8Array, dpi);
		} else if (type === 'image/jpeg') {
			uint8Array = changeJpegDpi(uint8Array, dpi);
		}

		log.timeEnd('canvas to blob');
		return new Blob([uint8Array, blob.slice(33)], { type });
	}

	log.timeEnd('canvas to blob');
	return blob;
}
