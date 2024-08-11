import type { tunnelappTunnelInstanceDataSchema } from '#schemas/tunnel-instance.ts';
import type { z } from '@-/zod';

export type TunnelInstanceData = z.infer<
	typeof tunnelappTunnelInstanceDataSchema
>;
