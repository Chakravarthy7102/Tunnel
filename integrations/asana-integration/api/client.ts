import { ApiAsana } from '#api';
import type { Id } from '@-/database';
import { env } from '@-/env';
import { APP_ENV } from '@-/env/app';
import { ApiUrl } from '@-/url/api';
import * as Asana from 'asana';
import { $try, err, ok } from 'errok';

export const ApiAsana_getClient = ({
	organizationMemberId,
}: {
	organizationMemberId: Id<'OrganizationMember'>;
}) => ($try(async function*() {
	const data = yield* ApiAsana.chooseTokenType({
		organizationMemberId,
	}).safeUnwrap();

	if (data === null || !data.accessToken || !data.refreshToken) {
		return err(new Error('Asana access token or refresh token is missing'));
	}

	const { accessToken } = yield* ApiAsana.getAccessToken({
		organizationMemberId,
		accessToken: data.accessToken,
		refreshToken: data.refreshToken,
		expiresIn: data.expiresIn,
		createdAt: data.createdAt,
		isOrganization: data.isOrganization,
	}).safeUnwrap();

	const webappUrl = ApiUrl.getWebappUrl({
		fromRelease: APP_ENV === 'production' ? 'production' : null,
		withScheme: true,
	});

	return ok(
		Asana.Client.create({
			clientId: env('ASANA_APP_CLIENT_ID'),
			clientSecret: env('ASANA_APP_CLIENT_SECRET'),
			redirectUri: `${webappUrl}/api/callbacks/asana`,
			defaultHeaders: {
				'Asana-Enable': 'new_goal_memberships,new_user_task_lists',
			},
		}).useOauth({
			credentials: {
				access_token: accessToken,
			},
		}),
	);
}));
