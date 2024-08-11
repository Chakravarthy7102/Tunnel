import { WebappApiRedirect } from '#api-redirect';
import { setResponseAuthCookies } from '#utils/auth.ts';
import {
	parseWosSessionString,
	type WorkosOauthException,
	type WorkosSession,
} from '@-/auth';
import { getWorkos } from '@-/auth/workos';
import { env } from '@-/env';
import { logger } from '@-/logger';
import { nextQueryHandlers } from '@-/next-query-handlers/server';
import { ApiUrl } from '@-/url/api';
import { ApiUser } from '@-/user/api';
import { z } from '@-/zod';
import destr from 'destru';
import { ResultAsync } from 'errok';
import { type NextRequest, NextResponse } from 'next/server';
import nullthrows from 'nullthrows-es';

export function createAuthenticateWithCodeRouteHandler(
	_options?: { oauthProvider: 'google' | 'github' },
) {
	return async function GET(request: NextRequest) {
		const workos = getWorkos();
		const code = request.nextUrl.searchParams.get('code');
		const getWebappUrl = ApiUrl.webappUrlFactory({
			fromHeaders: request.headers,
			withScheme: true,
		});
		const { searchParams } = new URL(request.url);
		const state = searchParams.get('state');

		if (!code) {
			return NextResponse.redirect(getWebappUrl('/login'));
		}

		let session: WorkosSession;
		const sessionResult = await ResultAsync.fromPromise(
			workos.userManagement.authenticateWithCode({
				code,
				clientId: env('NEXT_PUBLIC_WORKOS_CLIENT_ID'),
			}),
			(error) => error as WorkosOauthException,
		);

		if (sessionResult.isOk()) {
			session = sessionResult.value;
		} else {
			const errorData = sessionResult.error.rawData;
			switch (errorData.code) {
				case 'organization_selection_required': {
					const organization = nullthrows(errorData.organizations[0]);

					// For now, just select the first one
					session = await workos.userManagement
						.authenticateWithOrganizationSelection({
							clientId: env('NEXT_PUBLIC_WORKOS_CLIENT_ID'),
							organizationId: organization.id,
							pendingAuthenticationToken:
								errorData.pending_authentication_token,
						});
					break;
				}

				// GitHub OAuth needs the user to enter a 6-digit code to verify their email
				case 'email_verification_required': {
					const workosUsers = await workos.userManagement.listUsers({
						email: errorData.email,
					});
					const workosUser = workosUsers.data[0];
					if (!workosUser) {
						return NextResponse.redirect(
							getWebappUrl('/login', {
								toast: 'User not found',
							}),
						);
					}

					return NextResponse.redirect(
						getWebappUrl('/verify-email', {
							'workos-user-id': workosUser.id,
							'pending-authentication-token':
								errorData.pending_authentication_token,
							'email': errorData.email,
						}),
					);
				}

				default: {
					logger.error(sessionResult.error);
					return NextResponse.redirect(
						getWebappUrl('/login', {
							toast: errorData.message,
						}),
					);
				}
			}
		}

		const workosUser = session.user;

		// `ApiUser.ensureFromWorkosUser` will automatically create a database user based on a WorkOS user if it doesn't exist
		const actorUserId = await ApiUser.ensureFromWorkosUser({
			input: { workosUser },
		}).unwrapOrThrow();

		const stateParseResult = z.object({ next: z.string() })
			.safeParse(destr(state));

		const response = await (async () => {
			if (stateParseResult.success) {
				const { next } = stateParseResult.data;

				const redirectOnAuthenticatedHandler = nextQueryHandlers
					.redirectOnAuthenticatedAsUser.fromNextQuery({ next });

				if (redirectOnAuthenticatedHandler !== null) {
					return NextResponse.redirect(
						redirectOnAuthenticatedHandler.getRedirectUrl({
							accessToken: session.accessToken,
							refreshToken: session.refreshToken,
							actorUserId,
						}),
					);
				}

				const fulfillLoginRequestOnAuthenticatedHandler = nextQueryHandlers
					.fulfillLoginRequestOnAuthenticated.fromNextQuery({ next });

				if (fulfillLoginRequestOnAuthenticatedHandler !== null) {
					const { redirectUrl } =
						await fulfillLoginRequestOnAuthenticatedHandler
							.fulfillLoginRequest({
								actorRefData: { type: 'User', id: actorUserId },
								accessToken: session.accessToken,
								refreshToken: session.refreshToken,
							});

					return NextResponse.redirect(redirectUrl);
				}
			}

			const url = request.nextUrl.clone();
			url.searchParams.delete('code');
			url.pathname = '/get-started';

			const redirectUrl = url.toString().replace(
				url.origin,
				ApiUrl.getWebappUrl({
					fromHeaders: request.headers,
					withScheme: true,
				}),
			);
			return NextResponse.redirect(redirectUrl);
		})();

		await setResponseAuthCookies(response, session);

		return response;
	};
}

export function createSetAuthenticationCookiesRouteHandler() {
	return async function GET(request: NextRequest) {
		const webappBaseUrl = ApiUrl.getWebappUrl({
			withScheme: true,
			fromHeaders: request.headers,
		});
		const { searchParams } = new URL(request.url);
		const next = searchParams.get('next') ?? undefined;
		const wosSession = searchParams.get('wos-session') ??
			request.cookies.get('wos-session')?.value ?? null;

		// If there is no "wos-session" cookie or search param, that means the user is unauthenticated
		if (wosSession === null) {
			logger.debug('No session found, redirecting to login...');
			return NextResponse.redirect(
				`${webappBaseUrl}/login${
					next ? `?next=${encodeURIComponent(next)}` : ''
				}`,
			);
		}

		const session = await parseWosSessionString(wosSession);
		const response = await (async () => {
			const actorUserId = await ApiUser.ensureFromWorkosUser({
				input: { workosUser: session.user },
			}).unwrapOrThrow();
			const redirectOnAuthenticatedAsUserHandler = nextQueryHandlers
				.redirectOnAuthenticatedAsUser.fromNextQuery({ next });

			if (redirectOnAuthenticatedAsUserHandler !== null) {
				const redirectUrl = redirectOnAuthenticatedAsUserHandler.getRedirectUrl(
					{
						accessToken: session.accessToken,
						refreshToken: session.refreshToken,
						actorUserId,
					},
				);
				return NextResponse.redirect(redirectUrl);
			}

			const fulfillLoginRequestOnAuthenticatedHandler = nextQueryHandlers
				.fulfillLoginRequestOnAuthenticated.fromNextQuery({ next });

			if (fulfillLoginRequestOnAuthenticatedHandler !== null) {
				const { redirectUrl } = await fulfillLoginRequestOnAuthenticatedHandler
					.fulfillLoginRequest({
						actorRefData: { type: 'User', id: actorUserId },
						accessToken: session.accessToken,
						refreshToken: session.refreshToken,
					});

				return NextResponse.redirect(redirectUrl);
			}

			// By default, if no redirect URL is provided via "?next=", we should redirect to the home redirect
			return NextResponse.redirect(
				`${webappBaseUrl}${await WebappApiRedirect.getHomeRedirectPath({
					actorUser: { _id: actorUserId },
				})}`,
			);
		})();

		if (searchParams.get('wos-session') !== null) {
			await setResponseAuthCookies(response, session);
		}

		return response;
	};
}
