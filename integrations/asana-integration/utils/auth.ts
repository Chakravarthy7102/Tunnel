import { RELEASE } from '@-/env/app';
import { ApiUrl } from '@-/url/api';

interface AuthUrlParams {
	organizationMemberId: string;
	redirectPath: string | null;
	isPersonalConnection?: boolean;
}

export function getAsanaAuthUrl(args: AuthUrlParams) {
	const state = getState(args);
	const clientId = getClientId();
	const redirectUri = getRedirectUri();

	return generateAuthUrl(clientId, redirectUri, state);
}

function getState(params: AuthUrlParams): string {
	return JSON.stringify({
		organizationMemberId: params.organizationMemberId,
		redirectPath: params.redirectPath,
		isPersonalConnection: params.isPersonalConnection,
	});
}

function getClientId(): string {
	return RELEASE === null ?
		'1206446048432310' :
		'1206550168979903';
}

function getRedirectUri(): string {
	return ApiUrl.getWebappUrl({
		fromRelease: RELEASE,
		withScheme: true,
		path: '/api/callbacks/asana',
	});
}

function generateAuthUrl(
	clientId: string,
	redirectUri: string,
	state: string,
): string {
	return `https://app.asana.com/-/oauth_authorize?client_id=${clientId}&redirect_uri=${
		encodeURIComponent(
			redirectUri,
		)
	}&response_type=code&state=${
		encodeURIComponent(state)
	}&code_challenge_method=S256&code_challenge=671608a33392cee13585063953a86d396dffd15222d83ef958f43a2804ac7fb2&scope=default`;
}
