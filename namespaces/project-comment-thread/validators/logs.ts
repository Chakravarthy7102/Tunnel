import { v } from '@-/convex/values';
import { vNullable } from 'corvex';

export const networkLogEntryValidator = v.object({
	id: v.string(),
	url: v.string(),
	method: v.string(),
	initiatorType: vNullable(v.string()),
	startTime: v.number(),
	decodedBodySize: vNullable(v.number()),
	encodedBodySize: vNullable(v.number()),
	transferSize: vNullable(v.number()),
	requestHeaders: v.any(),
	requestBody: vNullable(v.string()),
	responseBody: vNullable(v.string()),
	responseStatusCode: vNullable(v.number()),
	responseEnd: vNullable(v.number()),
	responseHeaders: v.any(),
	source: vNullable(v.union(
		v.literal('fetch'),
		v.literal('XMLHttpRequest'),
		v.literal('serviceWorker'),
	)),
});

const consoleLogEntryValidator = v.object({
	id: v.string(),
	type: v.string(),
	payload: v.array(v.string()),
	timestamp: v.number(),
	file: v.string(),
});

const oldNetworkLogEntryValidator = v.object({
	id: v.string(),
	payload: v.string(),
	timestamp: v.number(),
	source: v.optional(
		v.union(
			v.literal('fetch'),
			v.literal('XMLHttpRequest'),
			v.literal('serviceWorker'),
		),
	),
});

export const logsValidator = v.object({
	networkHistory: v.array(oldNetworkLogEntryValidator),
	consoleHistory: v.array(consoleLogEntryValidator),
});
