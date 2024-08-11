// eslint-disable-next-line unicorn/prefer-node-protocol -- We use the `buffer` npm package
import { Buffer } from 'buffer/index.js';
import isArrayBuffer from 'is-array-buffer';
import { formDataToBlob } from './form-data.ts';

const NAME = Symbol.toStringTag;

/**
	Check if `obj` is a URLSearchParams object
	ref: https://github.com/node-fetch/node-fetch/issues/296#issuecomment-307598143
*/
const isURLSearchParameters = (object: any): object is URLSearchParams => {
	return (
		typeof object === 'object' &&
		typeof object.append === 'function' &&
		typeof object.delete === 'function' &&
		typeof object.get === 'function' &&
		typeof object.getAll === 'function' &&
		typeof object.has === 'function' &&
		typeof object.set === 'function' &&
		typeof object.sort === 'function' &&
		object[NAME] === 'URLSearchParams'
	);
};

/**
	Check if `object` is a W3C `Blob` object (which `File` inherits from)
*/
export const isBlob = (object: any): object is Blob => {
	return (
		object &&
		typeof object === 'object' &&
		typeof object.arrayBuffer === 'function' &&
		typeof object.type === 'string' &&
		typeof object.stream === 'function' &&
		typeof object.constructor === 'function' &&
		/^(Blob|File)$/.test(object[NAME])
	);
};

export function getBodyAsBufferOrBlobOrStream(
	body: BodyInit | null | undefined,
): ReadableStream | Blob | Buffer | null | undefined {
	const processedBody = (() => {
		switch (true) {
			case body === null: {
				return null;
			}

			case body === undefined: {
				return undefined;
			}

			case isURLSearchParameters(body): {
				return Buffer.from(body.toString());
			}

			case isBlob(body): {
				return body;
			}

			case Buffer.isBuffer(body): {
				return body;
			}

			case isArrayBuffer(body): {
				return Buffer.from(body);
			}

			case ArrayBuffer.isView(body): {
				return Buffer.from(body.buffer, body.byteOffset, body.byteLength);
			}

			case body instanceof ReadableStream: {
				return body;
			}

			case body instanceof FormData: {
				return formDataToBlob(body);
			}

			default: {
				return Buffer.from(String(body));
			}
		}
	})();

	switch (true) {
		case processedBody === null: {
			return null;
		}

		case processedBody === undefined: {
			return undefined;
		}

		case Buffer.isBuffer(processedBody): {
			return processedBody;
		}

		case isBlob(processedBody): {
			return processedBody;
		}

		default: {
			// `body` is a ReadableStream
			return processedBody;
		}
	}
}
