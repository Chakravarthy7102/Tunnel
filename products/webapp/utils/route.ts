import type { RouteError } from '@-/errors';
import { logger } from '@-/logger';
import type { ResultAsync } from 'errok';
import type { NextRequest } from 'next/server';

export function resultRoute(
	handler: (request: NextRequest) => ResultAsync<Response, RouteError>,
) {
	return async (request: NextRequest) => {
		const result = await handler(request);
		if (result.isErr()) {
			logger.error('A route error occurred:', result.error);
			return result.error.response;
		}

		return result.value;
	};
}
