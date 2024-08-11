import type { tunnelApiRouter } from '#utils/api.ts';
import type { TrpcClient } from '@-/trpc/client';

export type TunnelApiRouter = typeof tunnelApiRouter;
export type WebappTrpc = TrpcClient<TunnelApiRouter>;
