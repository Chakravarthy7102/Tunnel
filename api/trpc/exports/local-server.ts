import { getErrorFormatter } from '#utils/error.ts';
import { SuperJSON } from '@-/superjson';
import { initTRPC } from '@trpc/server';

export function createTrpcServerHelpers<
	$Context extends object,
>({ apiName }: { apiName: string }) {
	const t = initTRPC.context<$Context>().create({
		allowOutsideOfServer: true,
		// A cast to `DataTransformer` is needed here to avoid the "non-portable" error from using the exact `superjson` type
		transformer: SuperJSON,
		// We want to log the errors in the server
		errorFormatter: getErrorFormatter<$Context>({
			apiName,
		}),
	});

	return {
		procedure: t.procedure,
		middleware: t.middleware,
		router: t.router,
	};
}

export { observable } from '@trpc/server/observable';
