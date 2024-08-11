import { createDefineProcedure } from '@-/procedure';
import { createTrpcServerHelpers } from '@-/trpc/server';

export const { defineProcedure, router } = createDefineProcedure(
	createTrpcServerHelpers({
		apiName: 'Webapp',
	}),
);
