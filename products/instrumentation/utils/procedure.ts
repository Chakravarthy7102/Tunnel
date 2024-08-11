import { createDefineProcedure } from '@-/procedure';
import { createTrpcServerHelpers } from '@-/trpc/local-server';

export const { defineProcedure, router } = createDefineProcedure(
	createTrpcServerHelpers({ apiName: 'Instrumentation' }),
);
