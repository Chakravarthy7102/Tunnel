import { z } from '@-/zod';

export const redirectOnAuthenticatedAsUser_input = z.object({
	redirectUrl: z.string(),
});
