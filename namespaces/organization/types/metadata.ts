import type { organizationMetadataSchema } from '#schemas/metadata.ts';
import type { z } from '@-/zod';

export type OrganizationMetadata = z.infer<typeof organizationMetadataSchema>;
