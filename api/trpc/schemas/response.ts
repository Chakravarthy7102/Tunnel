import { z } from '@-/zod';

export const trpcSuccessResponseSchema = z.object({
	id: z.string(),
	result: z.object({
		type: z.literal('data'),
		data: z.string(),
	}),
});

export const trpcErrorResponseSchema = z.object({
	id: z.string(),
	error: z.object({
		json: z.object({
			message: z.string(),
			code: z.number(),
			data: z
				.object({
					code: z.string().optional(),
					httpStatus: z.string().optional(),
					stack: z.string().optional(),
					path: z.string().optional(),
				})
				.optional(),
		}),
	}),
});

export const trpcResponseSchema = z.union([
	trpcSuccessResponseSchema,
	trpcErrorResponseSchema,
]);
