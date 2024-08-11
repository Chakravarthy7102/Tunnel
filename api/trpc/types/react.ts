import type { createTRPCReact } from '@trpc/react-query';
import type { AnyTRPCRouter } from '@trpc/server';

export type TrpcReact<AppRouter extends AnyTRPCRouter> = ReturnType<
	typeof createTRPCReact<AppRouter>
>;
