import type { tunnelInstancePageSecretStorageDataSchema } from '#schemas/data.ts';
import type { z } from '@-/zod';

export type TunnelInstancePageSecretStorageData = z.infer<
	typeof tunnelInstancePageSecretStorageDataSchema
>;
