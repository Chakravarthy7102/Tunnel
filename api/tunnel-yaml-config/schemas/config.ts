import { z } from '@-/zod';

/**
	The schema for the configuration located inside `tunnel.yaml`
*/
export const tunnelYamlConfigSchema = z.object({
	/**
		Used for hosted tunnels
	*/
	dockerfile: z.string().optional(),
	experimental: z
		.object({
			clickToCode: z.boolean().default(false),
		})
		.optional(),
});
