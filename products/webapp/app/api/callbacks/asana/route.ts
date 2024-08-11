/* eslint-disable complexity -- TODO */

import { getIntegrationRedirects } from '#utils/integration-redirect-url.ts';
import { ApiAnalytics } from '@-/analytics/api';
import { ApiConvex } from '@-/convex/api';
import type { Id } from '@-/database';
import { env } from '@-/env';
import { logger } from '@-/logger';
import { ApiUrl } from '@-/url/api';
import { z } from '@-/zod';
import destr from 'destru';
import { DateTime } from 'luxon';
import { type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
	const serverAnalytics = ApiAnalytics.getServerAnalytics();
	const redirect = getIntegrationRedirects(request, 'asana');

	try {
		const url = new URL(request.url);
		const code = url.searchParams.get('code');
		const state = url.searchParams.get('state');

		if (!state || !code) {
			logger.error('Redirecting due to missing state or code');
			return redirect.missingParams();
		}

		const decodedStateParseResult = z
			.object({
				isPersonalConnection: z.boolean().optional(),
				organizationMemberId: z.string(),
				redirectPath: z.string().nullable(),
			}).safeParse(destr(state));

		if (!decodedStateParseResult.success) {
			logger.error('Redirecting because state could not be decoded');
			return redirect.invalidState();
		}

		const {
			organizationMemberId,
			isPersonalConnection,
			redirectPath,
		} = decodedStateParseResult.data;

		const organizationMember = await ApiConvex.v.OrganizationMember.get({
			from: { id: organizationMemberId as Id<'OrganizationMember'> },
			include: {
				organization: true,
				user: true,
			},
		}).unwrapOrThrow();

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- todo
		if (organizationMember === null) {
			return redirect.organizationMemberNotFound();
		}

		const tokenData = await fetch('https://app.asana.com/-/oauth_token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams({
				grant_type: 'authorization_code',
				client_id: env('ASANA_APP_CLIENT_ID'),
				client_secret: env('ASANA_APP_CLIENT_SECRET'),
				code,
				redirect_uri: ApiUrl.getWebappUrl({
					fromHeaders: request.headers,
					withScheme: true,
					path: '/api/callbacks/asana',
				}),
			}),
		}).then(async (res) => res.json());

		if (!tokenData.access_token || !tokenData.refresh_token) {
			return redirect.missingAccessToken({ organizationMember });
		}

		const selfAsanaAccount = await fetch(
			'https://app.asana.com/api/1.0/users/me',
			{
				method: 'GET',
				headers: {
					Authorization: `Bearer ${tokenData.access_token}`,
					Accept: 'application/json',
				},
			},
		).then(async (res) => res.json());

		if (isPersonalConnection) {
			await ApiConvex.v.OrganizationMemberIntegration.create({
				input: {
					type: 'OrganizationMemberAsanaAccount',
					data: {
						organizationMember: organizationMember._id,
						asanaGid: selfAsanaAccount.data.gid,
						asanaName: selfAsanaAccount.data.name,
						asanaEmail: selfAsanaAccount.data.email,
						accessToken: tokenData.access_token,
						refreshToken: tokenData.refresh_token,
						expiresIn: tokenData.expires_in,
						createdAt: DateTime.now().toSeconds(),
					},
				},
			}).unwrapOrThrow();
		} else {
			await ApiConvex.v.Organization.update({
				input: {
					id: organizationMember.organization._id,
					updates: {
						asanaOrganization: {
							refresh_token: tokenData.refresh_token,
							access_token: tokenData.access_token,
							expires_in: tokenData.expires_in,
							created_at: DateTime.now().toSeconds(),
							gid: selfAsanaAccount.data.workspaces[0].gid,
							default: null,
							createAutomatically: false,
						},
					},
				},
			}).unwrapOrThrow();
		}

		if (isPersonalConnection) {
			void serverAnalytics.user.connectedAsanaAccount({
				userId: organizationMember.user._id,
			});
		} else {
			void serverAnalytics.user.connectedAsanaOrganization({
				userId: organizationMember.user._id,
				organizationId: organizationMember.organization._id,
			});
		}

		return redirect.success({ organizationMember, redirectPath });
	} catch (error: unknown) {
		logger.error('Redirecting due to update error:', error);
		return redirect.unknownError();
	}
}
