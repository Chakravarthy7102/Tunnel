import type { dotTunnelJsonSchema } from '#schemas/dot-tunnel-json.ts';
import type { z } from '@-/zod';

export type DotTunnelJson = z.infer<typeof dotTunnelJsonSchema>;
