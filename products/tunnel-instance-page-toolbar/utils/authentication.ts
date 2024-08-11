import type { PageToolbarContext } from '#types';
import { getPageToolbarSecretStorage } from '#utils/storage.ts';
import { RELEASE } from '@-/env/app';
import { HostEnvironmentType, type HostnameType } from '@-/host-environment';
import { logger } from '@-/logger';
import { clientNextQueryHandlers } from '@-/next-query-handlers/client';
import { ApiUrl } from '@-/url/api';

export function getAuthenticateUrl(
	{ hostnameType, hostEnvironmentType }: {
		hostnameType: HostnameType;
		hostEnvironmentType: HostEnvironmentType;
	},
) {
	// dprint-ignore
	const tunnelappAuthenticateUrl =
		hostnameType === 'tunnelapp' ?
			ApiUrl.getTunnelappUrl({
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- Guaranteed to exist
				subdomain: window.location.hostname.split('.')[0]!,
				withScheme: true,
				path: '/__tunnel/api/authenticate',
				query: {
					redirectUrl: window.location.href,
					hostEnvironmentType,
				}
			}) :
		(
			hostnameType === 'local' &&
			hostEnvironmentType !== HostEnvironmentType.scriptTag
		) ||
		// If the toolbar is on `tunnel.test`, it means we're using it in development
		window.location.hostname === 'tunnel.test' ?
			`${window.location.protocol}//${window.location.hostname}${
				window.location.port === '' ? '' : `:${window.location.port}`
			}/__tunnel/api/authenticate?redirectUrl=${encodeURIComponent(
				window.location.href
			)}&hostEnvironmentType=${hostEnvironmentType}` :
		// Otherwise, we need to authenticate through the local proxy server
		ApiUrl.getTunnelappUrl({
			withScheme: true,
			path: '/__tunnel/api/authenticate',
			query: {
				redirectUrl: window.location.href,
				hostEnvironmentType
			}
		});

	const webappAuthenticateUrl = clientNextQueryHandlers
		.redirectOnAuthenticatedAsUser.appendNextToUrl(
			ApiUrl.getWebappUrl({
				fromRelease: RELEASE,
				withScheme: true,
				path: '/authenticate',
			}),
			{ redirectUrl: tunnelappAuthenticateUrl },
		);

	return webappAuthenticateUrl;
}

export function logout({
	context,
}: {
	context: PageToolbarContext<{
		isOnline: true;
	}>;
}): void {
	const state = context.store.getState();
	const pageToolbarSecretStorage = getPageToolbarSecretStorage();
	pageToolbarSecretStorage.setSync({
		actorUserId: null,
		accessToken: null,
		refreshToken: null,
	});

	// dprint-ignore
	const tunnelappUnauthenticateUrl =
		state.hostnameType === 'tunnelapp' ?
			ApiUrl.getWebappUrl({
				fromRelease: RELEASE,
				withScheme: true,
				path: '/__tunnel/api/unauthenticate',
				query: {
					redirectUrl: window.location.href,
					hostEnvironmentType: state.hostEnvironmentType
				}
			}) :
		state.hostnameType === 'local' && state.hostEnvironmentType !== HostEnvironmentType.scriptTag ?
			`${window.location.protocol}//${window.location.hostname}:${
				window.location.port
			}/__tunnel/api/unauthenticate?redirectUrl=${encodeURIComponent(
				window.location.href
			)}&hostEnvironmentType=${state.hostEnvironmentType}` :
		ApiUrl.getWebappUrl({
			fromRelease: RELEASE,
			withScheme: true,
			path: '/__tunnel/api/unauthenticate',
			query: {
				redirectUrl: window.location.href,
				hostEnvironmentType: state.hostEnvironmentType
			}
		});

	logger.debug('Tunnelapp Unauthenticate URL: %O', tunnelappUnauthenticateUrl);

	window.location.href = tunnelappUnauthenticateUrl;
}
