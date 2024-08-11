/**
	Before loading the toolbar, we need to load the tunneled page data
*/

import 'history-events';
import { loadScriptSync } from '#utils/load-script.ts';
import { getToolbarAuthClient } from '@-/auth/toolbar';
import { parseTunnelCookies } from '@-/cookies';
import { ApiCookies } from '@-/cookies/api';
import type { Id } from '@-/database';
import { RELEASE } from '@-/env/app';
import { getTunnelInstancePageSecretStorage } from '@-/tunnel-instance-page-secret-storage';
import { createTunnelGlobalsObject } from '@-/tunneled-service-globals';
import { patchGlobals } from '@-/tunneled-service-window-injection/patch';
import { ApiUrl } from '@-/url/api';
import { z } from '@-/zod';
import destr from 'destru';
import * as Cookies from 'es-cookie';
import { decode } from 'js-base64';

// We need to patch globals in the script's entrypoint so that they are loaded synchronously
if (!('__tunnel__' in window)) {
	Object.defineProperty(window, '__tunnel__', {
		// We freeze our internal object for security reasons (to prevent malicious users with tampering with these properties)
		writable: false,
		enumerable: false,
		configurable: false,
		value: createTunnelGlobalsObject({
			tunneledServiceEnvironmentData: null,
		}),
	});
}

patchGlobals();

const scriptSrc = (document.currentScript as HTMLScriptElement).src;
if (scriptSrc.includes('.test')) {
	// @ts-expect-error: custom property
	globalThis.TUNNEL_RELEASE = null;
} else if (scriptSrc.includes('staging.tunnel.dev')) {
	// @ts-expect-error: custom property
	globalThis.TUNNEL_RELEASE = 'staging';
} else {
	// @ts-expect-error: custom property
	globalThis.TUNNEL_RELEASE = 'production';
}

const tunnelInstancePageSecretStorage = getTunnelInstancePageSecretStorage();

// Immediately save any sensitive cookies to `localStorage` and remove them
const { actorUserId } = parseTunnelCookies({
	cookieString: document.cookie,
});

tunnelInstancePageSecretStorage.setSync((data) => ({
	...data,
	...(actorUserId ? { actorUserId: actorUserId as Id<'User'> } : {}),
}));

const cookies = ApiCookies.get();
Cookies.remove(cookies.actorUserId.name);

const { projectId, branch: branchName } = document.currentScript?.dataset ?? {};

function getAuthDataFromHash() {
	const matches = window.location.hash.match(
		/#__tunnel_auth_(.*)__$/,
	);
	if (matches === null) {
		return null;
	}

	const [_, base64AuthData] = matches;
	if (!base64AuthData) {
		return null;
	}

	const parseResult = z.object({
		actorUserId: z.string(),
		accessToken: z.string(),
		refreshToken: z.string(),
	}).safeParse(destr(decode(base64AuthData)));

	if (!parseResult.success) {
		return null;
	}

	return parseResult.data;
}

if (window.location.hash.startsWith('#__tunnel_auth_')) {
	const authData = getAuthDataFromHash();
	if (authData !== null) {
		const toolbarAuthClient = getToolbarAuthClient();
		toolbarAuthClient.setTokensSync({
			actorUserId: authData.actorUserId as Id<'User'>,
			tokens: {
				accessToken: authData.accessToken,
				refreshToken: authData.refreshToken,
			},
		});
	}

	// Remove the tunnel hash from the URL without triggering a reload
	history.replaceState(
		{},
		document.title,
		window.location.pathname +
			window.location.search,
	);

	const { actorUserId } = tunnelInstancePageSecretStorage.getSync();

	loadScriptSync({
		src: ApiUrl.getWebappUrl({
			fromRelease: RELEASE,
			withScheme: true,
			path: '/__tunnel/script-tag/set-globals.js',
			query: {
				...(projectId === undefined ? {} : { projectId }),
				...(!actorUserId ? {} : { actorUserId }),
				...(branchName === undefined ? {} : { branchName }),
			},
		}),
	});
} else {
	const { actorUserId } = tunnelInstancePageSecretStorage.getSync();

	loadScriptSync({
		src: ApiUrl.getWebappUrl({
			fromRelease: RELEASE,
			withScheme: true,
			path: '/__tunnel/script-tag/set-globals.js',
			query: {
				...(projectId === undefined ? {} : { projectId }),
				...(!actorUserId ? {} : { actorUserId }),
				...(branchName === undefined ? {} : { branchName }),
			},
		}),
	});
}
