import type { localProxyApiRouter } from '#utils/api.ts';
import type { TrpcClient } from '@-/trpc/client';
import type { LocalProxyContext } from './context.ts';

export interface ApiContext {
	context: LocalProxyContext;
}

export type LocalProxyApiRouter = typeof localProxyApiRouter;
export type LocalProxyTrpc = TrpcClient<LocalProxyApiRouter>;
