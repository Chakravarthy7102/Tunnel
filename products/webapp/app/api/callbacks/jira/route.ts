import { getIntegrationRedirects } from '#utils/integration-redirect-url.ts';
import { ApiAnalytics } from '@-/analytics/api';
import { ApiConvex } from '@-/convex/api';
import type { Id } from '@-/database';
import { env } from '@-/env';
import { logger } from '@-/logger';
import { ApiUrl } from '@-/url/api';
import { z } from '@-/zod';
import destr from 'destru';
import ky from 'ky';
import { DateTime } from 'luxon';
import { type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
	const serverAnalytics = ApiAnalytics.getServerAnalytics();
	const redirect = getIntegrationRedirects(request, 'jira');

	try {
		const url = new URL(request.url);
		const code = url.searchParams.get('code');
		const state = url.searchParams.get('state');

		if (!state || !code) {
			return redirect.missingParams();
		}

		const decodedStateParseResult = z
			.object({
				organizationMemberId: z.string(),
				redirectPath: z.string().nullable(),
			}).safeParse(destr(state));

		if (!decodedStateParseResult.success) {
			return redirect.invalidState();
		}

		const { organizationMemberId, redirectPath } = decodedStateParseResult.data;

		const organizationMember = await ApiConvex.v.OrganizationMember.get({
			from: { id: organizationMemberId as Id<'OrganizationMember'> },
			include: {
				organization: {
					include: {
						jiraOrganization: true,
					},
				},
				user: true,
			},
		}).unwrapOrThrow();

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- tood
		if (organizationMember === null) {
			return redirect.organizationMemberNotFound();
		}

		const tokenData = await ky.post('https://auth.atlassian.com/oauth/token', {
			json: {
				grant_type: 'authorization_code',
				client_id: env('JIRA_APP_CLIENT_ID'),
				client_secret: env('JIRA_APP_CLIENT_SECRET'),
				code,
				redirect_uri: ApiUrl.getWebappUrl({
					fromHeaders: request.headers,
					withScheme: true,
					path: '/api/callbacks/jira',
				}),
			},
		}).then(async (res) =>
			res.json<
				{ access_token?: string; refresh_token?: string; expires_in: number }
			>()
		);

		if (!tokenData.access_token || !tokenData.refresh_token) {
			return redirect.missingAccessToken({ organizationMember });
		}

		const jiraOrganizations = await ky.get(
			'https://api.atlassian.com/oauth/token/accessible-resources',
			{
				headers: {
					Authorization: `Bearer ${tokenData.access_token}`,
					Accept: 'application/json',
				},
			},
		).then(async (res) => res.json<Array<{ id: string; url: string }>>());

		const jiraOrganizationData = jiraOrganizations.find((jiraOrganization) =>
			jiraOrganization.url ===
				organizationMember.organization.jiraOrganization?.url
		);

		if (!jiraOrganizationData) {
			return redirect.jiraOrganizationNotFound();
		}

		const selfJiraAccount = await ky.get(
			`https://api.atlassian.com/ex/jira/${jiraOrganizationData.id}/rest/api/3/myself`,
			{
				headers: {
					Authorization: `Bearer ${tokenData.access_token}`,
					Accept: 'application/json',
				},
			},
		).then(async (res) =>
			res.json<{
				accountId: string;
				displayName: string;
				emailAddress: string;
			}>()
		);

		await ApiConvex.v.OrganizationMemberIntegration.create({
			input: {
				type: 'OrganizationMemberJiraAccount',
				data: {
					organizationMember: organizationMember._id,
					jiraId: selfJiraAccount.accountId,
					jiraDisplayName: selfJiraAccount.displayName,
					jiraEmailAddress: selfJiraAccount.emailAddress,
					jiraCloudId: jiraOrganizationData.id,
					accessToken: tokenData.access_token,
					refreshToken: tokenData.refresh_token,
					expiresIn: tokenData.expires_in,
					createdAt: DateTime.now().toSeconds(),
				},
			},
		}).unwrapOrThrow();

		void serverAnalytics.user.connectedJiraAccount({
			userId: organizationMember.user._id,
		});

		return redirect.success({ organizationMember, redirectPath });
	} catch (error: unknown) {
		logger.error('Redirecting due to update error:', error);
		return redirect.unknownError();
	}
}
