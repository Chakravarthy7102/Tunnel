import { RELEASE } from '@-/env/app';
import { ApiUrl } from '@-/url/api';

interface AuthUrlParams {
	organizationMemberId: string;
	redirectPath: string | null;
}

export function getJiraAuthUrl(params: AuthUrlParams) {
	const state = getState(params);
	const clientId = getClientId();
	const redirectUri = getRedirectUri();

	return generateAuthUrl(clientId, redirectUri, state);
}

function getState(params: AuthUrlParams): string {
	return JSON.stringify({
		organizationMemberId: params.organizationMemberId,
		redirectPath: params.redirectPath,
	});
}

function getClientId(): string {
	return RELEASE === null ?
		'qoiRf3HcGX9TzcXeTknZySfbJsl776PQ' :
		'Cgwi29Pi7SClo322AeH0BJNYj4lfgWy9';
}

function getRedirectUri(): string {
	return ApiUrl.getWebappUrl({
		fromRelease: RELEASE,
		withScheme: true,
		path: '/api/callbacks/jira',
	});
}

function generateAuthUrl(
	clientId: string,
	redirectUri: string,
	state: string,
): string {
	return `https://auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=${clientId}&scope=read%3Ajira-work%20manage%3Ajira-data-provider%20manage%3Ajira-webhook%20write%3Ajira-work%20read%3Ajira-user%20manage%3Ajira-configuration%20manage%3Ajira-project%20offline_access&redirect_uri=${
		encodeURIComponent(
			redirectUri,
		)
	}&state=${encodeURIComponent(state)}&response_type=code&prompt=consent`;
}
