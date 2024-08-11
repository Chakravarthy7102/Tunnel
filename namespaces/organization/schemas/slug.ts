import { z } from '@-/zod';

export const organizationSlugSchema = z
	.string()
	.regex(/^[\da-z-]+$/)
	.min(1)
	.max(64);
