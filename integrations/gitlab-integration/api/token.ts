import { ApiConvex } from '@-/convex/api';
import type { Id } from '@-/database';
import { env } from '@-/env';
import { RELEASE } from '@-/env/app';
import { DocumentNotFoundError } from '@-/errors';
import { ApiUrl } from '@-/url/api';
import { $try, err, type TryOk } from 'errok';
import { DateTime } from 'luxon';

export const ApiGitlab_initializeUser = (
	{ code, organizationMemberId, organizationId }: {
		code: string;
		organizationMemberId: Id<'OrganizationMember'>;
		organizationId: Id<'Organization'>;
	},
) => ($try(async function*(
	$ok: TryOk<
		{
			accessToken: string;
			refreshToken: string;
			expiresIn: number;
			createdAt: number;
		}
	>,
) {
	const url = 'https://gitlab.com/oauth/token';
	const params = {
		client_id: env('NEXT_PUBLIC_GITLAB_APP_CLIENT_ID'),
		client_secret: env('GITLAB_APP_CLIENT_SECRET'),
		code,
		grant_type: 'authorization_code',
		redirect_uri: ApiUrl.getWebappUrl({
			fromRelease: RELEASE,
			withScheme: true,
			path: `/api/callbacks/gitlab`,
		}),
	};
	const searchParams = new URLSearchParams(params);

	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: searchParams.toString(),
	});

	if (!response.ok) {
		return err(new Error('Failed to get user access token'));
	}

	const result = await response.json();

	const { access_token, refresh_token, expires_in, created_at } = result;

	const userInfoResponse = await fetch('https://gitlab.com/api/v4/user', {
		headers: {
			'Authorization': `Bearer ${access_token}`,
		},
	});

	if (!userInfoResponse.ok) {
		return err(new Error('Failed to fetch user information from Gitlab'));
	}

	const userInfo = await userInfoResponse.json();
	const { id, username, name, email } = userInfo;

	yield* ApiConvex.v.OrganizationMemberIntegration.create({
		input: {
			type: 'OrganizationMemberGitlabAccount',
			data: {
				accessToken: access_token,
				refreshToken: refresh_token,
				expiresIn: expires_in,
				createdAt: created_at,
				gitlabDisplayName: name,
				gitlabEmail: email,
				gitlabUsername: username,
				gitlabId: id,
				organizationMember: organizationMemberId,
				organization: organizationId,
			},
		},
	}).safeUnwrap();

	return $ok({
		accessToken: access_token,
		refreshToken: refresh_token,
		expiresIn: expires_in,
		createdAt: created_at,
	});
}));

export const ApiGitlab_getAccessToken = ({ organizationMemberId }: {
	organizationMemberId: Id<'OrganizationMember'>;
}) => ($try(async function*(
	$ok: TryOk<{ accessToken: string }>,
) {
	const organizationMember = yield* ApiConvex.v.OrganizationMember.get({
		from: {
			id: organizationMemberId,
		},
		include: {
			linkedGitlabAccount: true,
		},
	}).safeUnwrap();

	if (organizationMember === null) {
		return err(new DocumentNotFoundError('OrganizationMember'));
	}

	if (!organizationMember.linkedGitlabAccount) {
		return err(
			new Error('Organization member does not have linked gitlab account'),
		);
	}

	const expirationTime = DateTime.fromMillis(
		organizationMember.linkedGitlabAccount.createdAt * 1000,
	).plus({
		seconds: organizationMember.linkedGitlabAccount.expiresIn,
	});

	if (DateTime.now() < expirationTime) {
		return $ok({
			accessToken: organizationMember.linkedGitlabAccount.accessToken,
		});
	}

	const url = 'https://gitlab.com/oauth/token';
	const params = {
		client_id: env('NEXT_PUBLIC_GITLAB_APP_CLIENT_ID'),
		client_secret: env('GITLAB_APP_CLIENT_SECRET'),
		refresh_token: organizationMember.linkedGitlabAccount.refreshToken,
		grant_type: 'refresh_token',
		redirect_uri: ApiUrl.getWebappUrl({
			fromRelease: RELEASE,
			withScheme: true,
			path: `/api/callbacks/gitlab`,
		}),
	};
	const searchParams = new URLSearchParams(params);

	const refreshResponse = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: searchParams.toString(),
	});

	if (!refreshResponse.ok) {
		return err(new Error('Could not get access token from gitlab'));
	}

	const refreshData = await refreshResponse.json();
	const { access_token, refresh_token, created_at, expires_in } = refreshData;

	// Assuming there's a function to update the organization member's GitLab account with the new tokens
	yield* ApiConvex.v.OrganizationMemberIntegration.update({
		input: {
			type: 'OrganizationMemberGitlabAccount',
			updates: {
				accessToken: access_token,
				createdAt: created_at,
				expiresIn: expires_in,
				refreshToken: refresh_token,
			},
			where: {
				organizationMember: organizationMember._id,
			},
		},
	}).safeUnwrap();

	return $ok({
		accessToken: access_token,
	});
}));
