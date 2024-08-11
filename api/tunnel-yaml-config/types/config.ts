import type { tunnelYamlConfigSchema } from '#schemas/config.ts';
import type { z } from '@-/zod';

export type TunnelYamlConfig = z.infer<typeof tunnelYamlConfigSchema>;
