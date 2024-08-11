import type { localProjectRuntimeSchema } from '#schemas/runtime.ts';
import type { z } from '@-/zod';

export type LocalProjectRuntime = z.infer<typeof localProjectRuntimeSchema>;
