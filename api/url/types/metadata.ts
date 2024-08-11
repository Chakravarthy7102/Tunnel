import type { tunnelappUrlMetadataSchema } from '#schemas/metadata.ts';
import type { z } from '@-/zod';

export type TunnelappUrlMetadata = z.infer<typeof tunnelappUrlMetadataSchema>;
