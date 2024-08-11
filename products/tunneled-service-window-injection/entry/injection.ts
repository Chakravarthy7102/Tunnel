/**
	@file This script is a self-removing synchronous <script> that adds tunnel injections to the global window object.

	Because it needs to be executed synchronously, it isn't loaded from the <script> tag; instead the injection code is inlined into the <script> tag to ensure it loads synchronously.
*/

import 'history-events';
import { applyTunneledServiceWindowInjection } from '#utils/injection.ts';
import { parseTunnelCookies } from '@-/cookies';
import { ApiCookies } from '@-/cookies/api';
import type { Id } from '@-/database';
import { getTunnelInstancePageSecretStorage } from '@-/tunnel-instance-page-secret-storage';
import * as Cookies from 'es-cookie';

const tunneledServiceEnvironmentData = (globalThis as any)
	.__TUNNELED_SERVICE_ENVIRONMENT_DATA__;

// Immediately save any sensitive cookies to `localStorage` and remove them
const { actorUserId, accessToken, refreshToken } = parseTunnelCookies({
	cookieString: document.cookie,
});
const tunnelCookies = ApiCookies.get();
Cookies.remove(tunnelCookies.actorUserId.name);
Cookies.remove(tunnelCookies.accessToken.name);
Cookies.remove(tunnelCookies.refreshToken.name);

const tunnelInstancePageSecretStorage = getTunnelInstancePageSecretStorage();

tunnelInstancePageSecretStorage.setSync((data) => ({
	...data,
	...(actorUserId ? { actorUserId: actorUserId as Id<'User'> } : {}),
	...(accessToken ? { accessToken } : {}),
	...(refreshToken ? { refreshToken } : {}),
}));

applyTunneledServiceWindowInjection({
	tunneledServiceEnvironmentData,
});

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- This file is executed in the context of a <script>, so `document.currentScript` isn't null
document.currentScript!.remove();
