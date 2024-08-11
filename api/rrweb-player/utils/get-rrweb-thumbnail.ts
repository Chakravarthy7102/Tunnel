import { domToBlob } from '@-/modern-screenshot';
import * as rrweb from 'rrweb';
import { rebuild } from 'rrweb-snapshot';

export async function getRrwebThumbnail({
	eventsArray,
	onFinish,
	container,
}: {
	eventsArray: any[];
	onFinish: (thumbnail: File | null) => void;
	container: HTMLElement | null;
}) {
	const snapshotEvent = eventsArray.find((event) =>
		event.type === rrweb.EventType.FullSnapshot
	);

	const metaEvent = eventsArray.find((event) =>
		event.type === rrweb.EventType.Meta
	);

	if (!container) {
		onFinish(null);
		return;
	}

	if (snapshotEvent && metaEvent) {
		const { height, width } = metaEvent.data;

		const iframe = document.createElement('iframe');
		iframe.style.position = 'absolute';
		iframe.style.top = '-9999px';
		iframe.style.left = '-9999px';
		iframe.style.width = `${width}px`;
		iframe.style.height = `${height}px`;
		container.append(iframe);

		await rebuild(snapshotEvent.data.node, {
			doc: iframe.contentDocument,
		});

		if (!iframe.contentDocument) {
			iframe.remove();
			onFinish(null);
			return;
		}

		const htmlElement = iframe.contentDocument.body;

		const { backgroundColor } = getComputedStyle(document.body);

		domToBlob(htmlElement, {
			width: document.documentElement.scrollWidth,
			height: document.documentElement.scrollHeight,
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
		}).then((blob) => {
			const file = new File([blob], 'screenshot.png', {
				type: 'image/png',
			});

			onFinish(file);
		}).catch(() => {
			iframe.remove();
			onFinish(null);
		});
	} else {
		onFinish(null);
	}
}
