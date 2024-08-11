import { RELEASE } from '@-/env/app';
import {
	getHostnameType,
	HostEnvironmentType,
} from '@-/host-environment';
import type { TunneledServiceEnvironmentData } from '@-/tunneled-service-environment';
import { ApiUrl } from '@-/url/api';
import { unreachableCase } from '@tunnel/ts';

export function getProjectLivePreviewPageToolbarJavascriptUrl({
	hostUrl,
}: {
	hostUrl: globalThis.URL;
}): string {
	const hostnameType = getHostnameType({ origin: hostUrl.origin });

	switch (hostnameType) {
		case 'local': {
			return `${hostUrl.origin}/__tunnel/toolbar.js`;
		}

		case 'script.js': {
			return ApiUrl.getWebappUrl({
				fromRelease: RELEASE,
				withScheme: true,
				path: '/__tunnel/toolbar.js',
			});
		}

		case 'tunnelapp': {
			return ApiUrl.getWebappUrl({
				fromRelease: RELEASE,
				withScheme: true,
				path: '/__tunnel/toolbar.js',
			});
		}

		default: {
			return unreachableCase(hostnameType);
		}
	}
}

export function getTunnelInstancePageToolbarCssUrl({
	tunneledServiceEnvironmentData,
}: {
	tunneledServiceEnvironmentData: TunneledServiceEnvironmentData<
		HostEnvironmentType
	>;
}) {
	const host = tunneledServiceEnvironmentData.hostEnvironment.type ===
			HostEnvironmentType.scriptTag ?
		ApiUrl.getWebappUrl({ withScheme: false, fromRelease: RELEASE }) :
		tunneledServiceEnvironmentData.hostEnvironment.type ===
				HostEnvironmentType.wrapperCommand ?
		window.location.host :
		ApiUrl.getWebappUrl({ withScheme: false, fromRelease: RELEASE });

	const scheme = host.startsWith('localhost') ? 'http' : 'https';
	return `${scheme}://${host}/__tunnel/toolbar.css`;
}

export function getTunnelInstancePageToolbarGlobalCssUrl({
	tunneledServiceEnvironmentData,
}: {
	tunneledServiceEnvironmentData: TunneledServiceEnvironmentData<
		HostEnvironmentType
	>;
}) {
	const host = tunneledServiceEnvironmentData.hostEnvironment.type ===
			HostEnvironmentType.scriptTag ?
		ApiUrl.getWebappUrl({ withScheme: false, fromRelease: RELEASE }) :
		tunneledServiceEnvironmentData.hostEnvironment.type ===
				HostEnvironmentType.wrapperCommand ?
		window.location.host :
		ApiUrl.getWebappUrl({ withScheme: false, fromRelease: RELEASE });

	const scheme = host.startsWith('localhost') ? 'http' : 'https';
	return `${scheme}://${host}/__tunnel/toolbar.global.css`;
}
