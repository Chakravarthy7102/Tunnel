import type { z, ZodSchema } from '@-/zod';

export interface NextQueryHandlerThis<$InputType extends ZodSchema> {
	input: z.infer<$InputType>;
}
