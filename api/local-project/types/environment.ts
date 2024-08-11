import type { localProjectEnvironmentSchema } from '#schemas/environment.ts';
import type { z } from '@-/zod';

export type LocalProjectEnvironment = z.infer<
	typeof localProjectEnvironmentSchema
>;
