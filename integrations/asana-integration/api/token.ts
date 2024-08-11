import type { AsanaOrganization } from '#types';
import { ApiConvex } from '@-/convex/api';
import type { Id } from '@-/database';
import { env } from '@-/env';
import { DocumentNotFoundError } from '@-/errors';
import { $try, err, type TryOk } from 'errok';
import { DateTime } from 'luxon';

export const ApiAsana_chooseTokenType = ({ organizationMemberId }: {
	organizationMemberId: Id<'OrganizationMember'>;
}) => ($try(async function*(
	$ok: TryOk<
		{
			accessToken: string;
			refreshToken: string;
			expiresIn: number;
			createdAt: number;
			asanaOrganization: AsanaOrganization;
			isOrganization: boolean;
		} | null
	>,
) {
	const organizationMember = yield* ApiConvex.v.OrganizationMember.get({
		from: { id: organizationMemberId },
		include: {
			linkedAsanaAccount: true,
			organization: {
				include: {
					asanaOrganization: true,
				},
			},
		},
	}).safeUnwrap();

	if (organizationMember === null) {
		return $ok(null);
	}

	if (organizationMember.organization.asanaOrganization) {
		if (organizationMember.linkedAsanaAccount) {
			return $ok({
				isOrganization: false,
				accessToken: organizationMember.linkedAsanaAccount.accessToken,
				refreshToken: organizationMember.linkedAsanaAccount.refreshToken,
				expiresIn: organizationMember.linkedAsanaAccount.expiresIn,
				createdAt: organizationMember.linkedAsanaAccount.createdAt,
				asanaOrganization: organizationMember.organization.asanaOrganization,
			});
		} else {
			return $ok({
				isOrganization: true,
				accessToken: organizationMember.organization.asanaOrganization
					.access_token as string,
				refreshToken: organizationMember.organization.asanaOrganization
					.refresh_token as string,
				expiresIn: organizationMember.organization.asanaOrganization
					.expires_in as number,
				createdAt: organizationMember.organization.asanaOrganization
					.created_at as number,
				asanaOrganization: organizationMember.organization.asanaOrganization,
			});
		}
	}

	return $ok(null);
}));

export const ApiAsana_getAccessToken = (args: {
	organizationMemberId: Id<'OrganizationMember'>;
	accessToken: string;
	refreshToken: string;
	expiresIn: number;
	createdAt: number;
	isOrganization: boolean;
}) => ($try(async function*(
	$ok: TryOk<{ accessToken: string }>,
) {
	const organizationMember = yield* ApiConvex.v.OrganizationMember.get({
		from: { id: args.organizationMemberId },
		include: {
			organization: {
				include: {
					asanaOrganization: true,
				},
			},
		},
	}).safeUnwrap();

	if (organizationMember === null) {
		return err(new DocumentNotFoundError('OrganizationMember'));
	}

	const expirationTime = DateTime.fromMillis(args.createdAt * 1000).plus({
		seconds: args.expiresIn,
	});

	if (DateTime.now() < expirationTime) {
		return $ok({
			accessToken: args.accessToken,
		});
	}

	const tokenData = await fetch('https://app.asana.com/-/oauth_token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: new URLSearchParams({
			grant_type: 'refresh_token',
			client_id: env('ASANA_APP_CLIENT_ID'),
			client_secret: env('ASANA_APP_CLIENT_SECRET'),
			refresh_token: args.refreshToken,
		}),
	}).then(async (res) => res.json());

	const { access_token, expires_in } = tokenData;

	if (args.isOrganization) {
		yield* ApiConvex.v.Organization.update({
			input: {
				id: organizationMember.organization._id,
				updates: {
					asanaOrganization: {
						...organizationMember.organization.asanaOrganization ?? {
							default: null,
							createAutomatically: false,
							gid: null,
							refresh_token: null,
						},
						access_token,
						expires_in,
						created_at: DateTime.now().toSeconds(),
					},
				},
			},
		}).safeUnwrap();
	} else {
		yield* ApiConvex.v.OrganizationMemberIntegration.update({
			input: {
				where: {
					organizationMember: organizationMember._id,
				},
				type: 'OrganizationMemberAsanaAccount',
				updates: {
					accessToken: tokenData.access_token,
					expiresIn: tokenData.expires_in,
					createdAt: DateTime.now().toSeconds(),
				},
			},
		}).safeUnwrap();
	}

	return $ok({
		accessToken: access_token,
	});
}));
