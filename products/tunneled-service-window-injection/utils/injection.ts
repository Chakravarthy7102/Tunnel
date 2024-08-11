import { patchWindowFetch, patchWindowXmlHttpRequest } from '#utils/fetch.ts';
import { getHostnameType, type HostEnvironmentType } from '@-/host-environment';
import type { TunneledServiceEnvironmentData } from '@-/tunneled-service-environment';
import { createTunnelGlobalsObject } from '@-/tunneled-service-globals';
import queryString from 'query-string';
import { patchConsoleMethods } from './logs.ts';
import { patchWindowWebsocket } from './websocket.ts';

export function applyTunneledServiceWindowInjection({
	tunneledServiceEnvironmentData,
}: {
	tunneledServiceEnvironmentData: TunneledServiceEnvironmentData<
		HostEnvironmentType
	>;
}) {
	if (!('__tunnel__' in window)) {
		Object.defineProperty(window, '__tunnel__', {
			// We freeze our internal object for security reasons (to prevent malicious users with tampering with these properties)
			writable: false,
			enumerable: false,
			configurable: false,
			value: createTunnelGlobalsObject({
				tunneledServiceEnvironmentData,
			}),
		});
	} else {
		// Might be null if loaded from the <script> tag
		// @ts-expect-error: custom property
		if (window.__tunnel__.tunneledServiceEnvironmentData === null) {
			// @ts-expect-error: custom property
			window.__tunnel__.tunneledServiceEnvironmentData =
				tunneledServiceEnvironmentData;
		}
	}

	// If the window has the `__tunnel__` metadata query parameter, remove it
	const searchQuery = queryString.parse(window.location.search);
	if ('__tunnel__' in searchQuery) {
		delete searchQuery.__tunnel__;
		window.history.replaceState(
			{},
			'',
			`${window.location.pathname}?${queryString.stringify(searchQuery)}`,
		);
	}

	patchConsoleMethods();
	patchWindowFetch();
	patchWindowXmlHttpRequest();

	const hostnameType = getHostnameType(window.location);
	// We should only patch requests on tunnelapp URLs
	if (hostnameType === 'tunnelapp') {
		patchWindowWebsocket();
	}
}
