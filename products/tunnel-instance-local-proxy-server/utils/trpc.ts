import type { Actor } from '@-/actor';
import { getCliAuthClient } from '@-/auth/cli';
import { RELEASE } from '@-/env/app';
import { createTrpcClient, getAuthorizationHeaders } from '@-/trpc/client';
import { ApiUrl } from '@-/url/api';
import type { WebappTrpc } from '@-/webapp';
import onetime from 'onetime';

export const getWebappTrpc: ({ actor }: {
	actor: Actor<'User'>;
}) => Promise<{
	webappTrpc: WebappTrpc;
}> = onetime(async ({ actor }) => {
	const webappTrpc: WebappTrpc = createTrpcClient({
		siteUrl: `${
			ApiUrl.getWebappUrl({
				withScheme: true,
				fromRelease: RELEASE,
			})
		}/api/trpc`,
		async headers({ op }) {
			const authorizationHeaders = await getAuthorizationHeaders({
				op,
				async getAccessToken() {
					const authClient = getCliAuthClient();
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
