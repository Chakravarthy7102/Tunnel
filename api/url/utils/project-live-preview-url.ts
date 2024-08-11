import { RELEASE } from '@-/env/app';

export function getReleaseProjectLivePreviewUrl({
	hostname,
	path,
	withScheme,
}: {
	hostname: string;
	path?: string;
	withScheme: boolean;
}): string {
	const releaseHostname = hostname.replace(
		'.tunnelapp.dev',
		RELEASE === null ?
			'.tunnelapp.test' :
			RELEASE === 'staging' ?
			'.staging.tunnelapp.dev' :
			'.tunnelapp.dev',
	);

	if (withScheme) {
		return `https://${releaseHostname}${path ?? ''}`;
	} else {
		return releaseHostname;
	}
}

export function isTunnelappDevUrl(url: string) {
	return url.endsWith('.tunnelapp.dev');
}

export function normalizeProjectLivePreviewUrl(
	hostnameOrUrl: string | globalThis.URL,
): string {
	const hostname = typeof hostnameOrUrl === 'string' ?
		hostnameOrUrl :
		hostnameOrUrl.hostname;

	if (hostname.endsWith('.tunnelapp.test')) {
		return hostname.replace('.tunnelapp.test', '.tunnelapp.dev');
	}

	if (hostname.endsWith('.staging.tunnelapp.dev')) {
		return hostname.replace('.staging.tunnelapp.dev', '.tunnelapp.dev');
	}

	return hostname;
}
