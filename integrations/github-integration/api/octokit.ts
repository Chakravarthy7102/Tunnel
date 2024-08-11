import {
	getOctokitApp,
	getOctokitAuthApp,
	getOctokitOauthApp,
} from '@-/github-app';

export const ApiGithub_getOctokitAuthApp = (
	{ installationId }: { installationId: string },
) => (getOctokitAuthApp({
	installationId,
}));

export const ApiGithub_getOctokitApp = () => getOctokitApp();

export const ApiGithub_getOctokitOauthApp = () => getOctokitOauthApp();
