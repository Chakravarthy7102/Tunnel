import { getHostnameFromRelease } from '@-/env/app';

export function ApiCookies_getSetCookiesUrl({
	cookieHostDomain,
	cookies,
	redirectUrl,
}: {
	cookieHostDomain?: {
		host: string;
		scheme: string;
	};
	cookies: Record<string, string | null>;
	redirectUrl: string;
}) {
	if (cookieHostDomain === undefined) {
		return `/api/set-cookies?cookies=${
			encodeURIComponent(
				JSON.stringify(cookies),
			)
		}&redirectUrl=${encodeURIComponent(redirectUrl)}`;
	} else {
		const releaseHostname = getHostnameFromRelease({ sld: 'tunnel' });

		return `${cookieHostDomain.scheme}://${cookieHostDomain.host}/${
			cookieHostDomain.host === releaseHostname ? '' : '__tunnel/'
		}api/set-cookies?cookies=${
			encodeURIComponent(
				JSON.stringify(cookies),
			)
		}&redirectUrl=${encodeURIComponent(redirectUrl)}`;
	}
}
