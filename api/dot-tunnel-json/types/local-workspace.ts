import type { localWorkspaceSchema } from '#schemas/local-workspace.ts';
import type { z } from '@-/zod';

export type LocalWorkspace = z.infer<typeof localWorkspaceSchema>;
