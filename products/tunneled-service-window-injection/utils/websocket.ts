import { select } from '@-/client-doc';
import { getActiveProjectLivePreview } from '@-/tunneled-service-environment';
import { getTunnelGlobals } from '@-/tunneled-service-globals';
import { toTunnelappUrl } from '@-/url';
import safeUrl from 'safer-url';

export function patchWindowWebsocket() {
	const tunnelGlobals = getTunnelGlobals();
	if (!tunnelGlobals) return;

	const globalThis_WebSocket = WebSocket;

	globalThis.WebSocket = Object.assign(function WebSocket(
		url: string | globalThis.URL,
		...args: any[]
	) {
		const originalUrl = safeUrl(url, window.location.href);
		if (originalUrl === null) {
			return new globalThis_WebSocket(url, ...args);
		}

		const getProjectLivePreview = () => {
			const tunnelGlobals = getTunnelGlobals();
			if (!tunnelGlobals) return null;
			const { getContext, tunneledServiceEnvironmentData } = tunnelGlobals;

			const context = getContext?.();
			const state = context?.store.getState();

			// dprint-ignore
			return state === undefined ?
				tunneledServiceEnvironmentData === null ?
					null :
				getActiveProjectLivePreview(tunneledServiceEnvironmentData) :
			state.projectLivePreviewId === null ?
				null :
			select(state, 'ProjectLivePreview', state.projectLivePreviewId);
		};

		const getTunnelInstanceProxyPreview = () => {
			const tunnelGlobals = getTunnelGlobals();
			if (!tunnelGlobals) return null;
			const { getContext, tunneledServiceEnvironmentData } = tunnelGlobals;

			const context = getContext?.();
			const state = context?.store.getState();

			// dprint-ignore
			return state === undefined ?
				tunneledServiceEnvironmentData === null ?
					null :
				tunneledServiceEnvironmentData.tunnelInstanceProxyPreview :
					state.tunnelInstanceProxyPreviewId === null ?
				null :
			select(state, 'TunnelInstanceProxyPreview', state.tunnelInstanceProxyPreviewId);
		};

		const newUrlString = toTunnelappUrl({
			projectLivePreview: getProjectLivePreview(),
			// dprint-ignore
			port:
				originalUrl.port !== ''
					? Number(originalUrl.port)
					: getTunnelInstanceProxyPreview()?.localServicePortNumber ?? 80,
			type: 'tunnel-instance-proxy-preview',
			originalUrl,
		});

		return new globalThis_WebSocket(newUrlString, ...args);
	}, WebSocket);
}
