import type { PageToolbarContext } from '#types';
import { useContextStore } from '#utils/context/_.ts';
import { getLocalProxyTrpc } from '#utils/trpc/local-proxy.ts';
import type { HostEnvironmentType } from '@-/host-environment';
import { logger } from '@-/logger';
import { type PropsWithChildren, useEffect } from 'react';

export function TunnelInstanceCliProvider({
	context,
	children,
}: PropsWithChildren<{
	context: PageToolbarContext<{
		hasTunnelInstanceProxyPreview: true;
		hostnameType: 'local';
		isOnline: true;
		hostEnvironmentType: HostEnvironmentType.wrapperCommand;
	}>;
}>) {
	const { tunnelInstanceProxyPreviewId, actor } = useContextStore(context);

	useEffect(() => {
		void (async () => {
			const { localProxyTrpc } = getLocalProxyTrpc({ context });

			if (actor !== null) {
				const result = await localProxyTrpc.tunnelInstanceProxyPreview.connect
					.mutate({
						actor,
						tunnelInstanceProxyPreviewId,
					});

				if (result.isErr()) {
					logger.error('Error connecting to tunnel instance:', result.error);
				}
			}
		})();
	}, [tunnelInstanceProxyPreviewId, actor]);

	return children;
}
