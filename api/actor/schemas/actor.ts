import { z } from '@-/zod';

export const actorSchema = z.object({
	type: z.string(),
	data: z.object({ id: z.string() }),
});
