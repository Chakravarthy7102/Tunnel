import { v } from '@-/convex/values';

export const githubOrganizationValidator = v.object({
	id: v.number(),
	type: v.string(),
	account: v.object({
		login: v.string(),
		avatar_url: v.string(),
		html_url: v.string(),
	}),
	html_url: v.string(),
});

export const githubRepositoryValidator = v.object({
	id: v.number(),
	url: v.string(),
	git_url: v.string(),
	html_url: v.string(),
	full_name: v.string(),
});
