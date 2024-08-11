import { logger } from '@-/logger';
import { blobToDataUrl, domToCanvas } from '@-/modern-screenshot';

export async function drawToCanvas(
	stream: MediaStream,
	overlay: HTMLDivElement,
	captureEntireScreen: boolean,
) {
	const canvas = document.createElement('canvas');
	const video = document.createElement('video');
	video.srcObject = stream;

	// Play it.
	await video.play();

	// Calculate the ratio of the overlay's position and size relative to the screen's size
	const screenW = window.innerWidth;
	const screenH = window.innerHeight;
	const videoW = video.videoWidth;
	const videoH = video.videoHeight;

	// Adjust for scroll
	const { scrollX, scrollY } = window;
	let sx;
	let sy;
	let sWidth;
	let sHeight;

	if (captureEntireScreen) {
		sx = 0;
		sy = 0;
		sWidth = videoW;
		sHeight = videoH;
		canvas.width = screenW;
		canvas.height = screenH;

		// Draw one video frame to canvas.
		const context = canvas.getContext('2d');
		if (context) {
			context.drawImage(
				video,
				sx,
				sy,
				sWidth,
				sHeight,
				0,
				0,
				canvas.width,
				canvas.height,
			);

			// Draw a blue rectangle where the overlay is
			const overlayX = ((overlay.offsetLeft - scrollX) / screenW) *
				canvas.width;
			const overlayY = ((overlay.offsetTop - scrollY) / screenH) *
				canvas.height;
			const overlayWidth = (overlay.offsetWidth / screenW) * canvas.width;
			const overlayHeight = (overlay.offsetHeight / screenH) * canvas.height;

			context.strokeStyle = '#00a3ff';
			context.lineWidth = 2;
			context.fillStyle = '#00a3ff10';

			context.strokeRect(overlayX, overlayY, overlayWidth, overlayHeight);
			context.fillRect(overlayX, overlayY, overlayWidth, overlayHeight);
		}

		return canvas;
	} else {
		sx = ((overlay.offsetLeft - scrollX) / screenW) * videoW;
		sy = ((overlay.offsetTop - scrollY) / screenH) * videoH;
		sWidth = (overlay.offsetWidth / screenW) * videoW;
		sHeight = (overlay.offsetHeight / screenH) * videoH;
		canvas.width = overlay.offsetWidth;
		canvas.height = overlay.offsetHeight;
		// Draw one video frame to canvas.
		const context = canvas.getContext('2d');
		if (context) {
			context.drawImage(
				video,
				sx,
				sy,
				sWidth,
				sHeight,
				0,
				0,
				canvas.width,
				canvas.height,
			);
		}

		return canvas;
	}
}

export async function canvasToFile(
	canvas: HTMLCanvasElement,
	fileName: string,
	fileType = 'image/png',
	quality = 1,
) {
	return new Promise<File>((resolve, reject) => {
		canvas.toBlob(
			(blob) => {
				if (!blob) {
					// reject the Promise if there was an error
					reject(new Error('Canvas to Blob conversion failed'));
					return;
				}

				// create a File from the Blob
				const file = new File([blob], fileName, {
					type: fileType,
					lastModified: Date.now(),
				});

				resolve(file);
			},
			fileType,
			quality,
		);
	});
}

export async function getCroppedScreenshot(
	element: HTMLElement,
): Promise<HTMLCanvasElement | null> {
	// Adjust for scroll
	const { scrollX, scrollY } = window;
	const { backgroundColor } = getComputedStyle(document.body);

	let canvas: HTMLCanvasElement;
	try {
		canvas = await domToCanvas(document.body, {
			height: document.documentElement.scrollHeight,
			width: document.documentElement.scrollWidth,
			backgroundColor: backgroundColor === 'rgba(0, 0, 0, 0)' ?
				'white' :
				backgroundColor,
			scrollX,
			scrollY,
			crop: {
				x: scrollX,
				y: scrollY,
				width: window.innerWidth,
				height: window.innerHeight,
			},
			filter(element) {
				// Check if the element's tag name matches 'tunnel-toolbar' (case-insensitive)
				if (
					'tagName' in element &&
					typeof element.tagName === 'string' &&
					element.tagName.toLowerCase() === 'tunnel-toolbar'
				) {
					return false; // Ignore the element
				}

				if (
					'id' in element && (
						element.id === 'tunnel-overlay-regular' ||
						element.id === 'tunnel-overlay-drag'
					)
				) {
					return false;
				}

				return true; // Don't ignore other elements
			},
			async fetchFn(url, options) {
				let response;
				try {
					response = await fetch(url);
				} catch (error: any) {
					// CORS error
					if (error.name === 'TypeError') {
						response = await fetch('https://corsproxy.io/?' + url);
					} else {
						throw error;
					}
				}

				if (!response.ok) {
					throw new Error('Failed fetch, not 2xx response', {
						cause: response,
					});
				}

				switch (options.responseType) {
					case 'dataUrl': {
						return response.blob().then(blobToDataUrl);
					}

					// eslint-disable-next-line unicorn/no-useless-switch-case -- self-documentation
					case 'text':
					default: {
						return response.text();
					}
				}
			},
		});
	} catch (error) {
		logger.error('Failed to capture screenshot:', error);
		return null;
	}

	const context = canvas.getContext('2d');

	if (!context) {
		return null;
	}

	// Draw a blue rectangle where the overlay is
	const {
		x: elementX,
		y: elementY,
		width: elementWidth,
		height: elementHeight,
	} = element.getBoundingClientRect();

	context.strokeStyle = '#00a3ff';
	context.lineWidth = 2;
	context.fillStyle = '#00a3ff10';

	context.strokeRect(
		elementX - 12,
		elementY - 12,
		elementWidth + 24,
		elementHeight + 24,
	);
	context.fillRect(
		elementX - 12,
		elementY - 12,
		elementWidth + 24,
		elementHeight + 24,
	);

	return canvas;
}
