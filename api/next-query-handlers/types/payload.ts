import type { nextQueryPayloadSchema } from '#schemas/payload.ts';
import type { z } from '@-/zod';

export type NextQueryPayload = z.infer<typeof nextQueryPayloadSchema>;
