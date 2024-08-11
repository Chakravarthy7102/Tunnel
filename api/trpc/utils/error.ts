import { logger } from '@-/logger';
import { ZodError } from '@-/zod';

export function getErrorFormatter<_$Context>({
	apiName,
}: {
	apiName: string;
}): any {
	return ({ error, shape, path, ctx }: any) => {
		if (
			shape.data.code !== 'REDIRECT' &&
			!error.extensions?.contextError &&
			ctx.req !== undefined
		) {
			logger.error(
				`${apiName} tRPC error @ ${path ?? '<unknown path>'}:`,
				error,
			);
		}

		return {
			...shape,
			data: {
				...shape.data,
				zodError: error.cause instanceof ZodError ?
					error.cause.flatten() :
					null,
				key: error.key,
			},
		};
	};
}
