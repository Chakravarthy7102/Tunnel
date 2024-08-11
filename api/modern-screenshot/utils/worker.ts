import { baseFetch, type BaseFetchOptions } from './fetch.ts';
import { consoleWarn } from './utils.ts';

const worker = self as unknown as Worker;

// eslint-disable-next-line unicorn/prefer-add-event-listener -- todo
worker.onmessage = async (event) => {
	const options = event.data as BaseFetchOptions & { rawUrl: string };
	const url = options.rawUrl || options.url;

	try {
		const result = await baseFetch(options);
		worker.postMessage({ url, result });
	} catch (error) {
		consoleWarn(error);
		worker.postMessage({ url });
	}
};
