import { getIntegrationRedirects } from '#utils/integration-redirect-url.ts';
import { resultRoute } from '#utils/route.ts';
import { ApiAnalytics } from '@-/analytics/api';
import { ApiConvex } from '@-/convex/api';
import type { Id } from '@-/database';
import { env } from '@-/env';
import { RouteError } from '@-/errors';
import { logger } from '@-/logger';
import { ApiSlack } from '@-/slack-integration/api';
import { ApiUrl } from '@-/url/api';
import { z } from '@-/zod';
import destr from 'destru';
import { $try, err, ok } from 'errok';
import { NextResponse } from 'next/server';

export const GET = resultRoute((request) => ($try(async function*() {
	const serverAnalytics = ApiAnalytics.getServerAnalytics();
	const redirect = getIntegrationRedirects(request, 'slack');
	const webappUrl = ApiUrl.getWebappUrl({
		withScheme: true,
		fromHeaders: request.headers,
	});

	try {
		const url = new URL(request.url);
		const code = url.searchParams.get('code');
		const state = url.searchParams.get('state');

		if (!state || !code) {
			return err(
				new RouteError('Invalid search parameters', redirect.home()),
			);
		}

		const decodedStateParseResult = z
			.object({
				isPersonalConnection: z.boolean().optional(),
				organizationMemberId: z.string(),
				redirectPath: z.string().nullable(),
			}).safeParse(destr(state));

		if (!decodedStateParseResult.success) {
			return err(
				new RouteError('Invalid state', redirect.home()),
			);
		}

		const {
			organizationMemberId,
			isPersonalConnection,
			redirectPath,
		} = decodedStateParseResult.data;

		const organizationMember = yield* ApiConvex.v.OrganizationMember.get({
			from: { id: organizationMemberId as Id<'OrganizationMember'> },
			include: {
				organization: true,
				user: true,
			},
		})
			.mapErr((error) => new RouteError(error.message, redirect.home()))
			.safeUnwrap();

		if (organizationMember === null) {
			return err(
				new RouteError('Organization member not found', redirect.home()),
			);
		}

		const tokenData = await fetch('https://slack.com/api/oauth.v2.access', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams({
				client_id: env('SLACK_APP_CLIENT_ID'),
				client_secret: env('SLACK_APP_CLIENT_SECRET'),
				code,
				grant_type: 'authorization_code',
				redirect_uri: ApiUrl.getWebappUrl({
					withScheme: true,
					path: '/api/callbacks/slack',
					fromHeaders: request.headers,
				}),
			}).toString(),
		}).then(async (res) => res.json());

		if (!tokenData.authed_user || !tokenData.authed_user.access_token) {
			return err(
				new RouteError(
					'Missing authentication data from Slack API response',
					redirect.missingAccessToken({ organizationMember }),
				),
			);
		}

		if (isPersonalConnection) {
			const slackClient = await ApiSlack.getClient({
				// We use `access_token` here because we haven't yet created the `OrganizationMemberSlackIntegration` doc yet
				accessToken: tokenData.authed_user.access_token,
			}).unwrapOrThrow();

			const selfSlackAccount = await slackClient.users.info({
				user: tokenData.authed_user.id,
			});

			if (
				!selfSlackAccount.user?.profile?.real_name ||
				!selfSlackAccount.user.profile.email
			) {
				logger.error('Redirecting due to missing email or name');
				return err(
					new RouteError(
						'Missing name/email',
						NextResponse.redirect(`${webappUrl}/home`),
					),
				);
			}

			yield* ApiConvex.v.OrganizationMemberIntegration.create({
				input: {
					type: 'OrganizationMemberSlackAccount',
					data: {
						organizationMember: organizationMember._id,
						slackId: tokenData.authed_user.id,
						slackDisplayName: selfSlackAccount.user.profile.real_name,
						slackEmail: selfSlackAccount.user.profile.email,
						accessToken: tokenData.authed_user.access_token,
					},
				},
			})
				.mapErr((error) => new RouteError(error.message, redirect.home()))
				.safeUnwrap();
		} else {
			yield* ApiConvex.v.Organization.update({
				input: {
					id: organizationMember.organization._id,
					updates: {
						slackOrganization: {
							accessToken: tokenData.access_token,
						},
					},
				},
			})
				.mapErr((error) => new RouteError(error.message, redirect.home()))
				.safeUnwrap();
		}

		if (isPersonalConnection) {
			void serverAnalytics.user.connectedSlackAccount({
				userId: organizationMember.user._id,
			});
		} else {
			void serverAnalytics.user.connectedSlackWorkspace({
				userId: organizationMember.user._id,
				organizationId: organizationMember.organization._id,
			});
		}

		return ok(redirect.success({ organizationMember, redirectPath }));
	} catch (error: any) {
		return err(
			new RouteError(
				'Unexpected error when connecting Slack integration: ' + error.message,
				redirect.unknownError(),
			),
		);
	}
})));
