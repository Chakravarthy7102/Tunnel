import { HTTPParser } from 'http-parser-js';
import { Buffer } from 'node:buffer';

interface ParseResponsePayload {
	shouldKeepAlive: boolean;
	upgrade: boolean;
	statusCode: number;
	statusMessage: string;
	httpVersionMajor: number;
	httpVersionMinor: number;
	headers: string[];
	trailers: string[];
	body: Buffer;
}

export function parseHttpResponse(input: Buffer): ParseResponsePayload {
	const parser = new HTTPParser(HTTPParser.RESPONSE);
	// eslint-disable-next-line unused-imports/no-unused-vars -- Copy-pasted from the source
	let complete = false;
	let shouldKeepAlive!: boolean;
	let upgrade!: boolean;
	let statusCode!: number;
	let statusMessage!: string;
	let httpVersionMajor!: number;
	let httpVersionMinor!: number;
	let headers: string[] = [];
	let trailers: string[] = [];
	const bodyChunks: Uint8Array[] = [];

	parser[HTTPParser.kOnHeadersComplete] = function kOnHeadersComplete(res) {
		shouldKeepAlive = res.shouldKeepAlive;
		upgrade = res.upgrade;
		statusCode = res.statusCode;
		statusMessage = res.statusMessage;
		httpVersionMajor = res.versionMajor;
		httpVersionMinor = res.versionMinor;
		headers = res.headers;
	};

	parser[HTTPParser.kOnBody] = function kOnBody(
		chunk,
		offset: number,
		length: number,
	) {
		bodyChunks.push(chunk.slice(offset, offset + length));
	};

	// This is actually the event for trailers, go figure.
	parser[HTTPParser.kOnHeaders] = function kOnHeaders(t) {
		trailers = t;
	};

	parser[HTTPParser.kOnMessageComplete] = function kOnMessageComplete() {
		complete = true;
	};

	// Since we are sending the entire Buffer at once here all callbacks above happen synchronously.
	// The parser does not do _anything_ asynchronous.
	// However, you can of course call execute() multiple times with multiple chunks, e.g. from a stream.
	// But then you have to refactor the entire logic to be async (e.g. resolve a Promise in kOnMessageComplete and add timeout logic).

	parser.execute(input);
	parser.finish();

	const body = Buffer.concat(bodyChunks);

	return {
		shouldKeepAlive,
		upgrade,
		statusCode,
		statusMessage,
		httpVersionMajor,
		httpVersionMinor,
		headers,
		body,
		trailers,
	};
}
