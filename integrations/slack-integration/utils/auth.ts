import { RELEASE } from '@-/env/app';
import { ApiUrl } from '@-/url/api';

interface AuthUrlParams {
	organizationMemberId: string;
	redirectPath: string | null;
	isPersonalConnection: boolean;
}

export function getSlackAuthUrl(args: AuthUrlParams) {
	const state = getState(args);
	const clientId = getClientId();
	const redirectUri = getRedirectUri();

	return generateAuthUrl(clientId, redirectUri, state);
}

function getState(params: AuthUrlParams): string {
	return JSON.stringify({
		organizationMemberId: params.organizationMemberId,
		isPersonalConnection: params.isPersonalConnection,
		redirectPath: params.redirectPath,
	});
}

function getClientId(): string {
	return RELEASE === null ?
		'3866728449860.6194077097505' :
		'3866728449860.6077010239748';
}

function getRedirectUri(): string {
	return ApiUrl.getWebappUrl({
		fromRelease: RELEASE,
		withScheme: true,
		path: '/api/callbacks/slack',
	});
}

function generateAuthUrl(
	clientId: string,
	redirectUri: string,
	state: string,
): string {
	const botScope =
		'app_mentions:read,channels:read,groups:read,im:read,mpim:read,chat:write,chat:write.public,users:read';
	const userScope =
		'channels:read,chat:write,groups:read,im:read,mpim:read,users:read';

	return `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=${botScope}&user_scope=${userScope}&state=${
		encodeURIComponent(state)
	}`;
}
