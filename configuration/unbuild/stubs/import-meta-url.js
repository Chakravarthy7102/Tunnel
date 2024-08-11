/* eslint-disable no-undef -- Might be executed in a browser */

// dprint-ignore
export const __import_meta_url =
	typeof document !== 'undefined' ?
		(document.currentScript && document.currentScript.src) ||
		// eslint-disable-next-line no-restricted-globals -- Guaranteed to be valid
		new URL('main.js', document.baseURI).href :
	typeof __filename !== 'undefined' ?
		// eslint-disable-next-line no-restricted-globals -- Guaranteed to be valid
		new URL('file:' + __filename).href :
	undefined;
