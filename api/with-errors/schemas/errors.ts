import { z, type ZodSchema } from '@-/zod';

export function withErrorsSchema<$Schema extends ZodSchema>(schema: $Schema) {
	return z.object({
		data: schema,
		errors: z.string().array(),
	});
}
