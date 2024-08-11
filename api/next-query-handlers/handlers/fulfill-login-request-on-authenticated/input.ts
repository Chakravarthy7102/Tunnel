import { z } from '@-/zod';

export const fulfillLoginRequestOnAuthenticated_input = z.object({
	userLoginRequestId: z.string(),
	redirectUrl: z.string(),
});
