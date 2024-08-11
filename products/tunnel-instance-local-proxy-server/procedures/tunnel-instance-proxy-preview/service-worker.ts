import { defineProcedure } from '#utils/procedure.ts';
import { ProcedureError } from '@-/errors';
import { logger } from '@-/logger';
import { z } from '@-/zod';
import { ok } from 'errok';
import ky from 'ky';

export const tunnelInstanceProxyPreview_hasTunnelServiceWorker =
	defineProcedure({
		input: z.object({
			url: z.string(),
		}),
		async query({ input }) {
			try {
				const response = await ky.get(
					input.url + '/__tunnel-service-worker.js',
				);
				const text = await response.text();
				return ok(text.includes('__tunnel-service-worker.js'));
			} catch (error) {
				logger.error('Failed checking __tunnel-service-worker.js:', error);
				return ok(false);
			}
		},
		error: ({ error }) =>
			new ProcedureError(
				'There was an error fetching the service worker',
				error,
			),
	});
