import type { instrumentationApiRouter } from '#utils/api.ts';
import type { TrpcClient } from '@-/trpc/client';

export type InstrumentationTrpc = TrpcClient<typeof instrumentationApiRouter>;
