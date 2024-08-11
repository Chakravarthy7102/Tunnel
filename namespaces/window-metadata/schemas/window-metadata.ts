import { z } from '@-/zod';

export const windowMetadataSchema = z.object({
	url: z.string(),
	timestamp: z.string(),
	os: z.object({ name: z.string().nullable(), version: z.string().nullable() }),
	browser: z.object({
		name: z.string().nullable(),
		version: z.string().nullable(),
	}),
	windowSize: z.object({
		width: z.number(),
		height: z.number(),
	}),
});
