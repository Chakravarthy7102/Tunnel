import {
	getIntegrationRedirects,
} from '#utils/integration-redirect-url.ts';
import { resultRoute } from '#utils/route.ts';
import { ApiAnalytics } from '@-/analytics/api';
import { ApiConvex } from '@-/convex/api';
import type { Id } from '@-/database';
import { env } from '@-/env';
import { RouteError } from '@-/errors';
import { ApiUrl } from '@-/url/api';
import { z } from '@-/zod';
import { LinearClient } from '@linear/sdk';
import destr from 'destru';
import { $try, err, ok } from 'errok';

export const GET = resultRoute((request) => ($try(async function*() {
	const serverAnalytics = ApiAnalytics.getServerAnalytics();
	const redirect = getIntegrationRedirects(request, 'linear');
	const webappUrl = ApiUrl.getWebappUrl({
		fromHeaders: request.headers,
		withScheme: true,
	});

	try {
		const url = new URL(request.url);
		const code = url.searchParams.get('code');
		const state = url.searchParams.get('state');

		if (state === null || code === null) {
			return err(
				new RouteError('Invalid search parameters', redirect.missingParams()),
			);
		}

		const decodedStateParseResult = z
			.object({
				isPersonalConnection: z.boolean().optional(),
				organizationMemberId: z.string(),
				redirectPath: z.string().nullable(),
			}).safeParse(destr(state));

		if (!decodedStateParseResult.success) {
			return err(new RouteError('Invalid state', redirect.invalidState()));
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

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- todo
		if (organizationMember === null) {
			return err(
				new RouteError(
					'Organization member not found',
					redirect.organizationMemberNotFound(),
				),
			);
		}

		const tokenData = await fetch('https://api.linear.app/oauth/token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams({
				client_id: env('LINEAR_APP_CLIENT_ID'),
				client_secret: env('LINEAR_APP_CLIENT_SECRET'),
				code,
				grant_type: 'authorization_code',
				redirect_uri: ApiUrl.getWebappUrl({
					fromHeaders: request.headers,
					withScheme: true,
					path: '/api/callbacks/linear',
				}),
			}).toString(),
		}).then(async (res) => res.json());

		if (!tokenData.access_token) {
			return err(
				new RouteError(
					'Missing access token',
					redirect.missingAccessToken({ organizationMember }),
				),
			);
		}

		const linearClient = new LinearClient({
			apiKey: tokenData.access_token,
		});

		const selfLinearAccount = await linearClient.viewer;

		if (isPersonalConnection) {
			yield* ApiConvex.v.OrganizationMemberIntegration.create({
				input: {
					type: 'OrganizationMemberLinearAccount',
					data: {
						organizationMember: organizationMember._id,
						linearId: selfLinearAccount.id,
						linearUsername: selfLinearAccount.displayName,
						linearDisplayName: selfLinearAccount.name,
						linearEmail: selfLinearAccount.email,
						accessToken: tokenData.access_token,
					},
				},
			})
				.mapErr((error) => new RouteError(error.message, redirect.home()))
				.safeUnwrap();
		} else {
			try {
				await linearClient.createWebhook({
					url: `${webappUrl}/api/webhooks/linear`,
					resourceTypes: ['Issue'],
					enabled: true,
					label: 'Tunnel',
				});
			} catch {
				// Webhook most likely already exists, so we can ignore this error
			}

			yield* ApiConvex.v.Organization.update({
				input: {
					id: organizationMember.organization._id,
					updates: {
						linearOrganization: {
							access_token: tokenData.access_token,
							default: null,
							createAutomatically: false,
						},
					},
				},
			})
				.mapErr((error) => new RouteError(error.message, redirect.home()))
				.safeUnwrap();
		}

		if (isPersonalConnection) {
			void serverAnalytics.user.connectedLinearAccount({
				userId: organizationMember.user._id,
			});
		} else {
			void serverAnalytics.user.connectedLinearWorkspace({
				userId: organizationMember.user._id,
				organizationId: organizationMember.organization._id,
			});
		}

		return ok(redirect.success({ organizationMember, redirectPath }));
	} catch (error: any) {
		return err(
			new RouteError(
				'Unexpected error while connecting Linear: ' + error.message,
				redirect.unknownError(),
			),
		);
	}
})));
