import type {
	trpcErrorResponseSchema,
	trpcResponseSchema,
	trpcSuccessResponseSchema,
} from '#schemas/response.ts';
import type { z } from '@-/zod';

export type TrpcSuccessResponse = z.infer<typeof trpcSuccessResponseSchema>;
export type TrpcErrorResponse = z.infer<typeof trpcErrorResponseSchema>;
export type TrpcResponse = z.infer<typeof trpcResponseSchema>;
