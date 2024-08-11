/// <reference no-default-lib="true"/>
/// <reference lib="es2021" />
/// <reference lib="WebWorker" />

import invariant from 'tiny-invariant';

const sw = self as unknown as ServiceWorkerGlobalScope;
// This is to make sure our `.includes('__tunnel-service-worker.js')` check for existence of a service worker works when the server worker is served directly (e.g. from a local proxy server).
self.__filename = '__tunnel-service-worker.js';

let port: MessagePort | undefined;
/**
	We intercept *every* request with our service worker because a request might fail from CORS issues, and we want to be able to retry those request across our Tunnel proxy server.
*/
sw.addEventListener('fetch', async (_event: FetchEvent) => {
	// port?.postMessage(
	// 	{
	// 		type: 'request',
	// 		payload: {
	// 			timestamp: Date.now(),
	// 			source: 'serviceWorker',
	// 			payload: SuperJSON.stringify({
	// 				url: event.request.url,
	// 				method: event.request.method,
	// 				headers: [...event.request.headers.entries()],
	// 			}),
	// 		} satisfies Omit<NetworkLogEntry, 'id'>,
	// 	},
	// );
});

self.addEventListener(
	'message',
	(event: MessageEvent) => {
		invariant(event.ports[0], 'not undefined');
		port = event.ports[0];
		port.postMessage({ type: 'ack' });
	},
);

self.addEventListener('install', (event) => {
	(event as any).waitUntil(sw.skipWaiting()); // Activate worker immediately
});

self.addEventListener('activate', (event) => {
	(event as any).waitUntil(sw.clients.claim()); // Become available to all pages
});
