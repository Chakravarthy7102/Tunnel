import type { PageToolbarContext } from '#types';
import { getToolbarAuthClient } from '@-/auth/toolbar';
import { RELEASE } from '@-/env/app';
import {
	createTrpcClient,
	getAuthorizationHeaders,
} from '@-/trpc/client';
import { ApiUrl } from '@-/url/api';
import type { WebappTrpc } from '@-/webapp';
import onetime from 'onetime';
import { getPageToolbarSecretStorage } from './storage.ts';

export const getWebappTrpc: (args: {
	context: PageToolbarContext<{
		isOnline: true;
	}>;
}) => {
	webappTrpc: WebappTrpc;
} = onetime(() => {
	const webappTrpc: WebappTrpc = createTrpcClient({
		siteUrl: `${
			ApiUrl.getWebappUrl({
				fromRelease: RELEASE,
				withScheme: true,
			})
		}/api/trpc`,
		onInvalidAuthToken() {
			const pageToolbarSecretStorage = getPageToolbarSecretStorage();
			pageToolbarSecretStorage.setSync({
				actorUserId: null,
				accessToken: null,
				refreshToken: null,
			});
			window.location.reload();
		},
		async headers({ op }) {
			const authorizationHeaders = await getAuthorizationHeaders({
				op,
				async getAccessToken({ actor }) {
					const authClient = getToolbarAuthClient();
					try {
						return (await authClient.getAccessToken({
							actorUserId: actor.data.id,
						})) ?? null;
					} catch {
						return null;
					}
				},
			});

			return {
				...authorizationHeaders,
			};
		},
	});

	return { webappTrpc };
});
