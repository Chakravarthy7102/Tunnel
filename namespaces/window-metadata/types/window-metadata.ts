import type { windowMetadataSchema } from '#schemas/window-metadata.ts';
import type { z } from '@-/zod';

export type WindowMetadata = z.infer<typeof windowMetadataSchema>;
