import type { cliStorageDataSchema, savedActorData } from '#schemas/data.ts';
import type { z } from '@-/zod';

export type CliStorageData = z.infer<typeof cliStorageDataSchema>;
export type SavedActorData = z.infer<typeof savedActorData>;
