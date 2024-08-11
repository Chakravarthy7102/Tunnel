import type { PageToolbarContext } from '#types';
import { isContext } from '#utils/context/is-context.ts';
import { useContextStore } from '#utils/context/use.ts';
import { registerServiceWorker } from '#utils/service-worker.ts';
import { getWebappTrpc } from '#utils/trpc.ts';
import { getLocalProxyTrpc } from '#utils/trpc/local-proxy.ts';
import { HostEnvironmentType } from '@-/host-environment';
import { useEffect } from 'react';

export function ServiceWorker({ context }: { context: PageToolbarContext }) {
	const state = useContextStore(context);

	useEffect(() => {
		void (async () => {
			if (
				isContext(context, state, {
					hostnameType: 'local',
					hostEnvironmentType: HostEnvironmentType.wrapperCommand,
				})
			) {
				const { localProxyTrpc } = getLocalProxyTrpc({ context });
				const hasTunnelServiceWorker = (await localProxyTrpc
					.tunnelInstanceProxyPreview
					.hasTunnelServiceWorker
					.query({
						url: window.location.origin,
					})).unwrapOrThrow();

				if (hasTunnelServiceWorker) {
					await registerServiceWorker();
				}
			} else if (isContext(context, state, { isOnline: true })) {
				const { webappTrpc } = getWebappTrpc({ context });
				const hasTunnelServiceWorker = (await webappTrpc.projectLivePreview
					.hasTunnelServiceWorker.query({
						url: window.location.origin,
					})).unwrapOrThrow();

				if (hasTunnelServiceWorker) {
					await registerServiceWorker();
				}
			}
		})();
	}, []);

	return null;
}
