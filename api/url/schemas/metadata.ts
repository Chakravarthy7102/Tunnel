import { z } from '@-/zod';

export const tunnelappUrlMetadataSchema = z.union([
	z.object({
		type: z.literal('proxy'),
		originalUrl: z.string(),
	}),
	z.object({
		type: z.literal('tunnel-instance-proxy-preview'),
		originalUrl: z.string(),
		/**
			The port needs to be stored in addition to the original URL because the end user might be using a local URL without a port number, but we still need to know which port number the local URL points to in order to proxy that port.
		*/
		port: z.number(),
	}),
]);
