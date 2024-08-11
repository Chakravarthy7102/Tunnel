import { z } from '@-/zod';

export const localProjectRuntimeSchema = z.object({
	localApplicationLocalAddress: z.string(),
});
