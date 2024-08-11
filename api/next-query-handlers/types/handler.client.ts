import type { z, ZodSchema } from '@-/zod';

export interface ClientNextQueryHandler<$InputSchema extends ZodSchema> {
	getQueryValue(input: z.infer<$InputSchema>): string;
	appendNextToUrl(url: string, input: z.infer<$InputSchema>): string;
}
