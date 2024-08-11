import { z } from '@-/zod';

export const githubOrganizationSchema = z.object({
	id: z.number(),
	type: z.string(),
	account: z.object({
		login: z.string(),
		avatar_url: z.string(),
		html_url: z.string(),
	}),
	html_url: z.string(),
});
