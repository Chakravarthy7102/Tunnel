import { getLocalProxy } from '#library/local-proxy.ts';
import { defineProcedure } from '#utils/procedure.ts';
import { idSchema } from '@-/database/schemas';
import { ProcedureError } from '@-/errors';
import { logger } from '@-/logger';
import { z } from '@-/zod';
import { ok } from 'errok';

/**
	Establishes a bi-directional websocket connection between the CLI and `@-/localtunnel-server` so that `@-/localtunnel-server` can directly invoke the CLI API routes.
*/
export const tunnelInstanceProxyPreview_connect = defineProcedure({
	input: z.object({
		actor: z.object({
			type: z.literal('User'),
			data: z.object({
				id: idSchema('User'),
			}),
		}),
		tunnelInstanceProxyPreviewId: idSchema('TunnelInstanceProxyPreview'),
	}),
	async mutation(
		{
			input: { tunnelInstanceProxyPreviewId, actor },
			ctx: { context },
		},
	) {
		const LocalProxy = getLocalProxy();

		logger.debug(
			`Connecting to tunnel instance ${tunnelInstanceProxyPreviewId}...`,
		);

		await LocalProxy.TunnelInstanceProxyPreview.connect({
			context,
			actor,
			tunnelInstanceProxyPreviewId,
		});

		logger.debug(
			`Connected to tunnel instance ${tunnelInstanceProxyPreviewId}!`,
		);

		return ok();
	},
	error: ({ error }) =>
		new ProcedureError(
			'There was an error connecting to the tunnel',
			error,
		),
});
