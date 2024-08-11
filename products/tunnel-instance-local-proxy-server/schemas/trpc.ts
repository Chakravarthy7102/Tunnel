import { z } from '@-/zod';

export const trpcSuccessfulResponseSchema = z.object({
	id: z.string(),
	method: z.enum(['query', 'mutation']),
	params: z.object({
		path: z.string(),
		// superjson-stringified input
		input: z.string(),
	}),
});

export const trpcErrorResponseSchema = z.object({
	id: z.null(),
	error: z.object({
		message: z.string(),
		code: z.number(),
		data: z.object({
			code: z.string(),
			httpStatus: z.number(),
			path: z.string().nullable(),
		}),
	}),
});

export const trpcMessageSchema = z.union([
	trpcSuccessfulResponseSchema,
	trpcErrorResponseSchema,
]);
