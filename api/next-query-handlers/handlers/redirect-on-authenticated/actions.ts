import type { NextQueryHandlerThis } from '#types';
import queryString from 'query-string';
import type { redirectOnAuthenticatedAsUser_input } from './input.ts';

export function redirectOnAuthenticatedAsUser_getRedirectUrl(
	this: NextQueryHandlerThis<typeof redirectOnAuthenticatedAsUser_input>,
	{
		refreshToken,
		accessToken,
		actorUserId,
	}: { refreshToken: string; accessToken: string; actorUserId: string },
): string {
	const { redirectUrl } = this.input;
	const { query } = queryString.parseUrl(redirectUrl);
	return queryString.stringifyUrl({
		url: redirectUrl,
		query: {
			...query,
			refreshToken,
			accessToken,
			actorUserId,
		},
	});
}
