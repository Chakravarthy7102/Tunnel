import type { inferRouterClient } from '@trpc/client';
import type { AnyTRPCRouter } from '@trpc/server';

export type TrpcClient<$Router extends AnyTRPCRouter> = inferRouterClient<
	$Router
>;
