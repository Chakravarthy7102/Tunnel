import { changeJpegDpi } from '#utils/change-jpeg-dpi.ts';
import {
	changePngDpi,
	detectPhysChunkFromDataUrl,
} from '#utils/change-png-dpi.ts';
import type { Context } from '#utils/context.ts';
import { orCreateContext } from '#utils/create-context.ts';
import type { Options } from '#utils/options.ts';
import { SUPPORT_ATOB, SUPPORT_BTOA } from '#utils/utils.ts';
import { domToCanvas } from './dom-to-canvas.ts';

export async function domToDataUrl<T extends Node>(
	node: T,
	options?: Options,
): Promise<string>;
export async function domToDataUrl<T extends Node>(
	context: Context<T>,
): Promise<string>;
export async function domToDataUrl(node: any, options?: any) {
	const context = await orCreateContext(node, options);
	const { log, quality, type, dpi } = context;
	const canvas = await domToCanvas(context);
	log.time('canvas to data url');
	let dataUrl = canvas.toDataURL(type, quality);
	if (
		['image/png', 'image/jpeg'].includes(type) &&
		dpi &&
		SUPPORT_ATOB &&
		SUPPORT_BTOA
	) {
		const [format, body] = dataUrl.split(',');
		if (body === undefined) {
			throw new Error('Invalid data url');
		}

		let headerLength = 0;
		let overwritepHYs = false;
		if (type === 'image/png') {
			const b64Index = detectPhysChunkFromDataUrl(body);
			// 28 bytes in dataUrl are 21bytes, length of phys chunk with everything inside.
			if (b64Index >= 0) {
				headerLength = Math.ceil((b64Index + 28) / 3) * 4;
				overwritepHYs = true;
			} else {
				headerLength = 33 / 3 * 4;
			}
		} else if (type === 'image/jpeg') {
			headerLength = 18 / 3 * 4;
		}

		// 33 bytes are ok for pngs and jpegs
		// to contain the information.
		const stringHeader = body.slice(0, Math.max(0, headerLength));
		const restOfData = body.slice(Math.max(0, headerLength));
		const headerBytes = window.atob(stringHeader);
		const uint8Array = new Uint8Array(headerBytes.length);
		for (let i = 0; i < uint8Array.length; i++) {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- We know it's not undefined
			uint8Array[i] = headerBytes.codePointAt(i)!;
		}

		const finalArray = type === 'image/png' ?
			changePngDpi(uint8Array, dpi, overwritepHYs) :
			changeJpegDpi(uint8Array, dpi);
		const base64Header = window.btoa(String.fromCodePoint(...finalArray));
		dataUrl = [format, ',', base64Header, restOfData].join('');
	}

	log.timeEnd('canvas to data url');
	return dataUrl;
}
