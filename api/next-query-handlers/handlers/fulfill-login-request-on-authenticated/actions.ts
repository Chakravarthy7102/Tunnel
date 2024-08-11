import type { NextQueryHandlerThis } from '#types';
import type { ActorRefData } from '@-/actor';
import { ApiUserLoginRequest } from '@-/user-login-request';
import type { fulfillLoginRequestOnAuthenticated_input } from './input.ts';

export async function fulfillLoginRequestOnAuthenticated_fulfillLoginRequest(
	this: NextQueryHandlerThis<typeof fulfillLoginRequestOnAuthenticated_input>,
	{
		actorRefData,
		refreshToken,
		accessToken,
	}: {
		actorRefData: ActorRefData<'User'>;
		refreshToken: string;
		accessToken: string;
	},
) {
	await ApiUserLoginRequest.fulfill({
		userId: actorRefData.id,
		userLoginRequestId: this.input.userLoginRequestId,
		accessToken,
		refreshToken,
	}).unwrapOrThrow();

	return {
		redirectUrl: this.input.redirectUrl,
	};
}
