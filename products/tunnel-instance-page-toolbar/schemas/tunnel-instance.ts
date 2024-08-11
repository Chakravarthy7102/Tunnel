import { z } from '@-/zod';

export const tunnelappTunnelInstanceDataSchema = z.object({
	allowedPortNumbers: z.array(z.number()),
	disallowedPortNumbers: z.array(z.number()),
	localTunnelProxyServerPortNumber: z.number().nullable(),
	name: z.string(),
	gitUrl: z.string().nullable(),
	slug: z.string(),
	subscriptionPlan: z.enum(['free', 'team', 'enterprise']),
	liveshareLink: z.string().nullable(),
	localUrl: z.string().nullable(),
});
