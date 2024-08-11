import * as procedures from '#procedures/_.ts';
import { router } from '#utils/procedure.ts';
import type { LocalProjectEnvironment } from '@-/local-project';
import { logger } from '@-/logger';
import { SuperJSON } from '@-/superjson';
import type { MutationProcedure, QueryProcedure } from '@-/trpc/server';
import { z } from '@-/zod';
import { createNestedNamespace } from '@tunnel/namespace';
import destr from 'destru';
import { getProperty } from 'dot-prop';
import type { UnionToIntersection } from 'type-fest';
import waitPort from 'wait-port';
import WebSocket from 'ws';

// dprint-ignore
type Namespaces<$Procedures extends Record<string, any>> = UnionToIntersection<
	{
		[K in keyof $Procedures]: {
			[Key in K extends `${infer $Namespace}_${string}` ? $Namespace : never]: {
				[
					Key in K extends `${string}_${infer $ProcedureName}` ?
						$ProcedureName :
						never
				]:
					$Procedures[K] extends MutationProcedure<
						infer $Def
					> ?
						MutationProcedure<
							{ input: $Def['input']; output: $Def['output'][] }
						> :
					$Procedures[K] extends QueryProcedure<
						infer $Def
					> ?
						QueryProcedure<
							{ input: $Def['input']; output: $Def['output'][] }
						> :
					never;
			};
		};
	}[keyof Procedures]
>;

type Procedures = typeof procedures;
function createRouters(): ReturnType<
	typeof router<
		// @ts-expect-error: todo
		{
			[Namespace in keyof Namespaces<Procedures>]: ReturnType<
				typeof router<Namespaces<Procedures>[Namespace]>
			>;
		}
	>
> {
	const procedureNamespaces = createNestedNamespace(procedures);

	const routers: Record<string, any> = {};
	for (const [namespace, procedures] of Object.entries(procedureNamespaces)) {
		routers[namespace] = router(procedures);
	}

	return router(routers) as any;
}

export const instrumentationApiRouter = createRouters();

/**
	The instrumentation API runs in the same process as the user's application,
	which is separate from the CLI API which runs in the Tunnel subprocess.

	We want to keep these APIs on separate servers so we can restart the user's
	application without restarting the CLI API server.
*/
export async function startInstrumentationApiServer({
	localProjectEnvironment,
}: {
	localProjectEnvironment: LocalProjectEnvironment;
}) {
	logger.debug('Starting instrumentation API server');

	const instrumentationApi = instrumentationApiRouter.createCaller({});

	await waitPort({
		port: localProjectEnvironment.localTunnelProxyServerPortNumber,
		output: 'silent',
	});
	const ws = new WebSocket(
		`ws://localhost:${localProjectEnvironment.localTunnelProxyServerPortNumber}/ws/instrumentation/${localProjectEnvironment.localServicePortNumber}/subscribe-from-loader`,
	);

	ws.addEventListener('message', async (message) => {
		// eslint-disable-next-line @typescript-eslint/no-base-to-string -- We know it's stringifiable
		const data = destr(message.data.toString());
		logger.debug('Received message from instrumentation API client', data);

		const request = z
			.object({
				id: z.string(),
				method: z.enum(['query', 'mutation']),
				params: z.object({
					path: z.string(),
					// superjson-stringified input
					input: z.string(),
				}),
			})
			.parse(data);

		const procedure = getProperty<any, any, any>(
			instrumentationApi,
			request.params.path,
		);

		if (procedure === undefined) {
			throw new Error(`Procedure not found: ${request.params.path}`);
		}

		const resultData = await procedure(SuperJSON.parse(request.params.input));

		logger.debug('Sending response to instrumentation API client', resultData);

		ws.send(
			JSON.stringify({
				id: request.id,
				result: {
					type: 'data',
					data: SuperJSON.stringify(resultData),
				},
			}),
		);
	});

	// We want to return this so that the caller can access it
	return ws;
}
