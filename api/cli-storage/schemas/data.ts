import { idSchema } from '@-/database/schemas';
import { z } from '@-/zod';
import { isCuid } from '@paralleldrive/cuid2';

export const savedActorData = z.object({
	actor: z.object({
		type: z.literal('User'),
		data: z.object({
			id: idSchema('User'),
		}),
	}),
	accessToken: z.string(),
	refreshToken: z.string(),
});

export const cliStorageDataSchema = z.object({
	currentActorString: z
		.custom<`User|${string}`>((val) => {
			if (typeof val !== 'string') return false;
			const [actorType, actorDocumentId] = val.split('|');
			if (actorType !== 'User') {
				return false;
			}

			if (actorDocumentId === undefined || !isCuid(actorDocumentId)) {
				return false;
			}

			return true;
		})
		.nullable(),
	savedActorsData: z.record(z.string(), savedActorData),
	currentOrganizationId: z.string().nullable(),
	logLevel: z.record(z.string(), z.string()),
});
