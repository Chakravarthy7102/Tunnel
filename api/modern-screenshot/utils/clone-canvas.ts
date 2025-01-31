import { consoleWarn, createImage } from './utils.ts';

export function cloneCanvas<T extends HTMLCanvasElement>(
	canvas: T,
): HTMLCanvasElement | HTMLImageElement {
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- TODO
	if (canvas.ownerDocument) {
		try {
			const dataURL = canvas.toDataURL();
			if (dataURL !== 'data:,') {
				return createImage(dataURL, canvas.ownerDocument);
			}
		} catch {
			//
		}
	}

	const cloned = canvas.cloneNode(false) as T;
	const ctx = canvas.getContext('2d');
	const clonedCtx = cloned.getContext('2d');

	try {
		if (ctx && clonedCtx) {
			clonedCtx.putImageData(
				ctx.getImageData(0, 0, canvas.width, canvas.height),
				0,
				0,
			);
		}

		return cloned;
	} catch (error) {
		consoleWarn('Failed to clone canvas', error);
	}

	return cloned;
}
