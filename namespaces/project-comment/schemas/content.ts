import { z, type ZodSchema } from '@-/zod';

const JSONContentSchema: ZodSchema<any> = z.lazy(() =>
	z.object({
		type: z.string().optional(),
		attrs: z.record(z.any()).optional(),
		content: z.array(JSONContentSchema).optional(),
		marks: z
			.array(
				z.object({
					type: z.string(),
					attrs: z.record(z.any()).optional(),
					text: z.string().optional(),
				}),
			)
			.optional(),
		text: z.string().optional(),
	})
);

export const projectCommentContentSchema = JSONContentSchema;
