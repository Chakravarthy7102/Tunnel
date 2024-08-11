import { env } from '@-/env';
import { App } from '@octokit/app';
import { createAppAuth } from '@octokit/auth-app';
import { OAuthApp } from '@octokit/oauth-app';
import { Octokit } from '@octokit/rest';

export function getOctokitOauthApp() {
	return new OAuthApp({
		clientType: 'oauth-app',
		clientId: env('NEXT_PUBLIC_GH_OAUTH_APP_CLIENT_ID'),
		clientSecret: env('GH_OAUTH_APP_CLIENT_SECRET'),
	});
}

export function getOctokitApp() {
	const app = new App({
		appId: env('GH_APP_ID'),
		privateKey: env('GH_APP_PRIVATE_KEY'),
	});

	return app;
}

export function getOctokitAuthApp({
	installationId,
}: {
	installationId: string;
}) {
	return new Octokit({
		authStrategy: createAppAuth,
		auth: {
			appId: env('GH_APP_ID'),
			privateKey: env('GH_APP_PRIVATE_KEY'),
			clientId: env('GH_APP_CLIENT_ID'),
			clientSecret: env('GH_APP_CLIENT_SECRET'),
			installationId,
		},
	});
}
