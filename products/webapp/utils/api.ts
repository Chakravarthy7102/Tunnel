import * as procedures from '#procedures/_.ts';
import { router } from '#utils/procedure.ts';
import type { AnyTRPCRouter } from '@trpc/server';
import { createNestedNamespace, type NestedNamespace } from '@tunnel/namespace';

type Procedures = typeof procedures;
function createRouters(): ReturnType<
	typeof router<
		// @ts-expect-error: todo
		{
			[Namespace in keyof NestedNamespace<Procedures>]: ReturnType<
				typeof router<NestedNamespace<Procedures>[Namespace]>
			>;
		}
	>
>;
function createRouters(): AnyTRPCRouter {
	const procedureNamespaces = createNestedNamespace(procedures);

	const routers: Record<string, any> = {};
	for (const [namespace, procedures] of Object.entries(procedureNamespaces)) {
		routers[namespace] = router(procedures);
	}

	return router(routers);
}

export const tunnelApiRouter = createRouters();
