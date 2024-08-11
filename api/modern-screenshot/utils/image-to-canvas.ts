import type { Context } from './context.ts';
import { consoleWarn, loadMedia } from './utils.ts';

export async function imageToCanvas<T extends HTMLImageElement>(
	image: T,
	context: Context,
): Promise<HTMLCanvasElement> {
	const {
		log,
		timeout,
		drawImageCount,
		drawImageInterval,
		crop,
	} = context;

	log.time('image to canvas');
	const loaded = await loadMedia(image, { timeout });
	const { canvas, context2d } = createCanvas(image.ownerDocument, context);
	const drawImage = () => {
		try {
			if (crop !== null) {
				// dprint-ignore
				context2d?.drawImage(
					loaded,
					crop.x, crop.y, crop.width, crop.height,
					0, 0, canvas.width, canvas.height
				);
			} else {
				context2d?.drawImage(loaded, 0, 0, canvas.width, canvas.height);
			}
		} catch (error) {
			consoleWarn('Failed to drawImage', error);
		}
	};

	drawImage();

	if (context.isEnable('fixSvgXmlDecode')) {
		for (let i = 0; i < drawImageCount; i++) {
			await new Promise<void>((resolve) => {
				setTimeout(() => {
					drawImage();
					resolve();
				}, i + drawImageInterval);
			});
		}
	}

	context.drawImageCount = 0;

	log.timeEnd('image to canvas');
	return canvas;
}

function createCanvas(ownerDocument: Document, context: Context) {
	const {
		width,
		height,
		crop,
		scale,
		backgroundColor,
		maximumCanvasSize: max,
	} = context;

	const canvas = ownerDocument.createElement('canvas');

	canvas.width = Math.floor((crop?.width ?? width) * scale);
	canvas.height = Math.floor((crop?.height ?? height) * scale);
	canvas.style.width = `${width}px`;
	canvas.style.height = `${height}px`;

	if (max) {
		if (canvas.width > max || canvas.height > max) {
			if (canvas.width > max && canvas.height > max) {
				if (canvas.width > canvas.height) {
					canvas.height *= max / canvas.width;
					canvas.width = max;
				} else {
					canvas.width *= max / canvas.height;
					canvas.height = max;
				}
			} else if (canvas.width > max) {
				canvas.height *= max / canvas.width;
				canvas.width = max;
			} else {
				canvas.width *= max / canvas.height;
				canvas.height = max;
			}
		}
	}

	const context2d = canvas.getContext('2d');

	if (context2d && backgroundColor) {
		context2d.fillStyle = backgroundColor;
		context2d.fillRect(0, 0, canvas.width, canvas.height);
	}

	return { canvas, context2d };
}
