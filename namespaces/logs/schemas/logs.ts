import { z } from '@-/zod';

export const networkLogEntrySchema = z.object({
	id: z.string(),
	url: z.string(),
	method: z.string(),
	initiatorType: z.string().nullable(),
	startTime: z.number(),
	responseEnd: z.number().nullable(),
	decodedBodySize: z.number().nullable(),
	encodedBodySize: z.number().nullable(),
	transferSize: z.number().nullable(),
	requestBody: z.string().nullable(),
	responseBody: z.string().nullable(),
	requestHeaders: z.record(z.string()),
	responseHeaders: z.record(z.string()),
	responseStatusCode: z.number().nullable(),
	duration: z.number().nullable().optional(),
	source: z.union([
		z.literal('fetch'),
		z.literal('XMLHttpRequest'),
		z.literal('serviceWorker'),
	]).nullable(),
});

export const networkLogEntriesSchema = z.array(networkLogEntrySchema);

export const consoleLogEntrySchema = z.object({
	id: z.string(),
	type: z.string(),
	// stringified by superjson
	payload: z.array(z.string()),
	file: z.string(),
	timestamp: z.number(),
});

export const sessionEventItemSchema = z.string();

export const logSchema = z.object({
	consoleHistory: z.array(consoleLogEntrySchema),
	networkHistory: z.array(z.any()),
});

export const sessionSchema = z.object({
	events: z.array(sessionEventItemSchema),
});
