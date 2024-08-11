import { idSchema } from '@-/database/schemas';
import { z } from '@-/zod';

export const tunnelInstancePageSecretStorageDataSchema = z.object({
	actorUserId: idSchema('User').nullable(),
	accessToken: z.string().nullable(),
	refreshToken: z.string().nullable(),
});
