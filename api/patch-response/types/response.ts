import type { IncomingHttpHeaders } from 'node:http';

export interface PatchedResponse {
	headers: IncomingHttpHeaders;
	body: Buffer;
	statusCode: number;
	httpVersionMajor: number;
	httpVersionMinor: number;
}
