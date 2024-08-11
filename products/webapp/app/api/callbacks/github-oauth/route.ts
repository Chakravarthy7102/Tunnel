import { ApiAnalytics } from '@-/analytics/api';
import { env } from '@-/env';
import { ApiGithub } from '@-/github-integration/api';
import { ApiUrl } from '@-/url/api';
import { ApiUser } from '@-/user/api';
import { ResultAsync } from 'errok';
import jwt from 'jsonwebtoken';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
	const octokitOauthApp = ApiGithub.getOctokitOauthApp();
	const { searchParams } = new URL(request.url);
	const code = searchParams.get('code');
	if (code === null) {
		return Response.json({ error: 'Missing `code` query parameter' }, {
			status: 400,
		});
	}

	const state = searchParams.get('state');
	if (state === null) {
		return Response.json({ error: 'Missing `code` query parameter' }, {
			status: 400,
		});
	}

	const payload = jwt.verify(state, env('JWT_SECRET_KEY'));
	if (typeof payload !== 'object' || !('userId' in payload)) {
		return Response.json({ error: 'Invalid `state` query parameter' }, {
			status: 400,
		});
	}

	const { userId } = payload;

	const createTokenResult = await ResultAsync.fromPromise(
		octokitOauthApp.createToken({ code }),
		(error) => error,
	);
	if (createTokenResult.isErr()) {
		return new Response(
			`Failed to create access token: ${String(createTokenResult.error)}`,
			{ status: 500 },
		);
	}

	const { authentication } = createTokenResult.value;
	const userOctokit = await ResultAsync.fromPromise(
		octokitOauthApp.getUserOctokit({
			token: authentication.token,
			scopes: ['user.email'],
		}),
		(error) => error,
	);
	if (userOctokit.isErr()) {
		return Response.json({
			error: `Failed to get user octokit: ${String(userOctokit.error)}`,
		}, {
			status: 500,
		});
	}

	const githubUser = await ResultAsync.fromPromise(
		userOctokit.value.request('GET /user'),
		(error) => error,
	);
	if (githubUser.isErr()) {
		return Response.json({
			error: `Failed to get GitHub user: ${String(githubUser.error)}`,
		}, {
			status: 500,
		});
	}

	const updateResult = await ApiUser.update({
		input: {
			id: userId,
			updates: {
				githubAccount: {
					userId: githubUser.value.data.id,
					username: githubUser.value.data.login,
					accessToken: authentication.token,
				},
			},
		},
	});

	if (updateResult.isErr()) {
		return Response.json({ error: 'Failed to update user' }, { status: 500 });
	}

	const serverAnalytics = ApiAnalytics.getServerAnalytics();
	void serverAnalytics.user.connectedGithubAccount({
		userId,
	});

	return Response.redirect(ApiUrl.getWebappUrl({
		fromHeaders: request.headers,
		withScheme: true,
		path: '/profile',
	}));
}
