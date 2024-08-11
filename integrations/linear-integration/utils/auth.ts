import { RELEASE } from '@-/env/app';
import { ApiUrl } from '@-/url/api';

interface AuthUrlParams {
	organizationMemberId: string;
	redirectPath: string | null;
	isPersonalConnection: boolean;
}

export function getLinearAuthUrl(params: AuthUrlParams) {
	const state = getState(params);
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
		'7d7c88186079298f0022240a48da273b' :
		'7575580a048073d8d3074324e4ba4c84';
}

function getRedirectUri(): string {
	return ApiUrl.getWebappUrl({
		fromRelease: RELEASE,
		withScheme: true,
		path: '/api/callbacks/linear',
	});
}

function generateAuthUrl(
	clientId: string,
	redirectUri: string,
	state: string,
): string {
	// eslint-disable-next-line no-restricted-properties -- Guaranteed to be valid
	const parsedState = JSON.parse(state) as AuthUrlParams;
	return `https://linear.app/oauth/authorize?client_id=${clientId}&redirect_uri=${
		encodeURIComponent(
			redirectUri,
		)
	}&response_type=code&scope=write&state=${
		encodeURIComponent(state)
	}&prompt=consent${
		!parsedState.isPersonalConnection ? '&actor=application' : ''
	}`;
}
