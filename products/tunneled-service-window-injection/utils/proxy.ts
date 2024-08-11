import mimicFunction from 'mimic-function';

export function createWindowProxy() {
	const { location } = window;

	const locationProxy = new Proxy(Object.create(null), {
		get(_target, property) {
			if (property === 'href') {
				// TODO: Get the original URL from environment
				// return getLocalhostUrl({
				// 	tunnelInstance,
				// 	tunnelUrl: location[property],
				// 	withScheme: true
				// });
			}

			// @ts-expect-error: can't be typed
			const value = location[property];
			if (typeof value === 'function') {
				if (property === 'replace') {
					const replace = location[property].bind(location);

					return (originalUrl: string) =>
						replace(
							originalUrl,
							// TODO
							// toTunnelappUrl({
							// 	originalUrl: safeUrl(originalUrl, window.location.href),
							// 	projectLivePreview,
							// 	tunnelInstance
							// })
						);
				}

				return value.bind(location);
			}

			// @ts-expect-error: can't be typed
			return location[property];
		},
		set(_target, property, value) {
			if (property === 'href') {
				// TODO
				// location[property] = toTunnelappUrl({
				// 	tunnelInstance,
				// 	projectLivePreview,
				// 	originalUrl: value
				// }).toString();
				return true;
			}

			// @ts-expect-error: can't be typed
			location[property] = value;

			return true;
		},
	});

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion -- type isn't actually right
	const windowProxy = new Proxy(window, {
		get(target, property, receiver) {
			if (property === 'window') {
				return windowProxy;
			}

			if (property === 'location') {
				return locationProxy;
			}

			// Using `eval` with bind causes it to become indirect, so we need to return it directly
			if (property === 'eval') {
				return eval;
			}

			// @ts-expect-error: can't be typed
			const value = target[property];
			if (value instanceof Function) {
				// This needs to be hardcoded because Zone.ts does a `global['Promise'] === patches['ZoneAwarePromise'])` assertion check
				if (property === 'Promise') {
					return Promise;
				}

				const fn = function(...args: any[]) {
					// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- new.target can be undefined
					if (new.target) {
						return new value(...args);
					} else {
						// @ts-expect-error: copied
						return value.apply(this === receiver ? target : this, args);
					}
				};

				mimicFunction(fn, value);
				Object.defineProperty(fn, 'prototype', {
					value: value.prototype,
				});

				return fn;
			}

			return value;
		},
		set(_target, property, value) {
			// Handling redirects from setting `window.location`
			if (property === 'location') {
				// TODO
				// (window as any)[property] = toTunnelappUrl({
				// 	release: context?.release ?? 'production',
				// 	projectLivePreview,
				// 	tunnelInstance,
				// 	originalUrl: value
				// });
				return true;
			}

			// @ts-expect-error: can't be typed
			window[property] = value;

			return true;
		},
	}) as typeof window;

	/**
		We have to patch the following functions to make sure they're called with the original `window` global variable (this is important because some frameworks like Angular patch these global function calls and transforms them into `addEventListener.call(window)`-style calls, which wouldn't work since we statically replace `window` with our window proxy).

		The following list of functions were generated from the following code:
		```js
		import globals from 'globals';

		(async () => {
			const w = new Proxy(window, {})
			let windowThisFunctions = []
			for (const key of Object.keys(globals.browser)) {
				try {
					await window[key].call(w, Array.from({ length: 20 }))
				} catch (e) {
					// Firefox
					if (e.message.includes('does not implement')) {
						windowThisFunctions.push(key)
					}
				}
			}
		})();
		```
	*/
	const windowThisFunctions = [
		'addEventListener',
		'alert',
		'atob',
		'blur',
		'btoa',
		'cancelAnimationFrame',
		'cancelIdleCallback',
		'clearInterval',
		'clearTimeout',
		'close',
		'confirm',
		'actionEvent',
		'find',
		'focus',
		'getComputedStyle',
		'getInclude',
		'matchMedia',
		'moveBy',
		'moveTo',
		'open',
		'postMessage',
		'print',
		'prompt',
		'queueMicrotask',
		'removeEventListener',
		'reportError',
		'requestAnimationFrame',
		'requestIdleCallback',
		'resizeBy',
		'resizeTo',
		'scroll',
		'scrollBy',
		'scrollTo',
		'setInterval',
		'setTimeout',
		'stop',
		'structuredClone',
		'fetch',
		'createImageBitmap',
	] as (keyof typeof window)[];

	for (const fnName of windowThisFunctions) {
		const fn = window[fnName];
		// @ts-expect-error: typescript

		window[fnName] = function(...args: any[]) {
			return fn.apply(this === windowProxy ? window : this, args);
		};
	}

	return windowProxy;
}
