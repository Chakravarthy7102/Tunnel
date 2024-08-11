import type { z, ZodSchema } from '@-/zod';

export type NextQueryHandler<
	$InputSchema extends ZodSchema,
	$Functions extends Record<string, (...args: any) => any>,
> = $Functions & {
	fromNextQuery({ next }: { next?: string }): $Functions | null;
	getQueryValue(input: z.infer<$InputSchema>): string;
	appendNextToUrl(url: string, input: z.infer<$InputSchema>): string;
};
