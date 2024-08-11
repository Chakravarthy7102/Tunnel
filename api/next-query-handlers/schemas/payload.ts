import { z } from '@-/zod';

export const nextQueryPayloadSchema = z.object({
	handler: z.string(),
	input: z.record(z.string(), z.unknown()),
});
