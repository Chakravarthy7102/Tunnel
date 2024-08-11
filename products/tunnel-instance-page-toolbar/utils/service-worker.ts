import { logger } from '@-/logger';
import invariant from 'tiny-invariant';

export async function registerServiceWorker() {
	if ('serviceWorker' in navigator) {
		try {
			/**
				This code works around a bug in Chrome where the service worker is not updated when the page is hard-refreshed.
				@see https://stackoverflow.com/a/66816077
			*/
			if (navigator.serviceWorker.controller) {
				const sw = await navigator.serviceWorker.getRegistration(
					navigator.serviceWorker.controller.scriptURL,
				);
				if (sw) {
					await sw.unregister();
				}

				await navigator.serviceWorker.register('/__tunnel-service-worker.js', {
					scope: '/',
				});
			} else {
				const url = window.location.protocol +
					'//' +
					window.location.host +
					'/__tunnel-service-worker.js';
				const sw = await navigator.serviceWorker.getRegistration(url);
				if (sw) {
					await sw.unregister();
				}

				await navigator.serviceWorker.register('/__tunnel-service-worker.js', {
					scope: '/',
				});
			}

			const worker = await navigator.serviceWorker.ready;
			invariant(worker.active !== null, 'worker should be active');

			const messageChannel = new MessageChannel();
			messageChannel.port1.addEventListener('messageerror', (event) => {
				logger.error('on message error', event);
			});

			messageChannel.port1.addEventListener('message', (event) => {
				switch (event.data.type) {
					case 'ack': {
						logger.debug('Successfully registered service worker');
						// context.store.setState({
						// 	isServiceWorkerActive: true,
						// });
						break;
					}

					case 'request': {
						// const tunnelGlobals = getTunnelGlobals();
						// if (tunnelGlobals === undefined) {
						// 	return;
						// }

						// const { networkLogsHistory } = tunnelGlobals;
						// networkLogsHistory.push({
						// 	id: createId(),
						// 	...event.data.payload,
						// });
						break;
					}

					default:
				}
			});

			messageChannel.port1.start();

			worker.active.postMessage(
				{},
				[messageChannel.port2],
			);
		} catch (error) {
			logger.error(`Registration failed with error:`, error);
		}
	}
}
